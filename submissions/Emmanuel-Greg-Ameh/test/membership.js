const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const hre = require("hardhat");

describe("MembershipManager", function () {

    async function deployMembershipManagerFixture() {
        const DEFAULT_THRESHOLD = hre.ethers.parseEther("1000");


        const [owner, user1, user2, nonOwner] = await hre.ethers.getSigners();


        const AccessToken = await hre.ethers.getContractFactory("AccessToken");
        const accessToken = await AccessToken.deploy(
            "AccessToken",
            "AT",
            owner.address
        );

        // Deploy BlockNft contract
        const BlockNft = await hre.ethers.getContractFactory("BlockNft");
        const blockNft = await BlockNft.deploy();


        const MembershipManager = await hre.ethers.getContractFactory("MembershipManager");
        const membershipManager = await MembershipManager.deploy(
            await accessToken.getAddress(),
            await blockNft.getAddress(),
            owner.address
        );

        return {
            membershipManager,
            accessToken,
            blockNft,
            owner,
            user1,
            user2,
            nonOwner,
            DEFAULT_THRESHOLD
        };
    }

    async function deployWithTokenBalancesFixture() {
        const fixture = await deployMembershipManagerFixture();
        const { accessToken, user1, user2, owner } = fixture;


        await accessToken.connect(owner).mint(
            hre.ethers.parseEther("1500"),
            user1.address
        );


        await accessToken.connect(owner).mint(
            hre.ethers.parseEther("500"),
            user2.address
        );

        return fixture;
    }

    describe("Deployment", function () {
        it("Should set the correct access token address", async function () {
            const { membershipManager, accessToken } = await loadFixture(
                deployMembershipManagerFixture
            );

            expect(await membershipManager.accessToken()).to.equal(
                await accessToken.getAddress()
            );
        });

        it("Should set the correct membership NFT address", async function () {
            const { membershipManager, blockNft } = await loadFixture(
                deployMembershipManagerFixture
            );

            expect(await membershipManager.membershipNFT()).to.equal(
                await blockNft.getAddress()
            );
        });

        it("Should set the correct owner", async function () {
            const { membershipManager, owner } = await loadFixture(
                deployMembershipManagerFixture
            );

            expect(await membershipManager.owner()).to.equal(owner.address);
        });

        it("Should set the correct initial minimum token threshold", async function () {
            const { membershipManager, DEFAULT_THRESHOLD } = await loadFixture(
                deployMembershipManagerFixture
            );

            expect(await membershipManager.minTokenThreshold()).to.equal(
                DEFAULT_THRESHOLD
            );
        });
    });

    describe("setMinTokenThreshold", function () {
        describe("Validations", function () {
            it("Should revert when non-owner tries to set threshold", async function () {
                const { membershipManager, nonOwner } = await loadFixture(
                    deployMembershipManagerFixture
                );
                const newThreshold = hre.ethers.parseEther("2000");

                await expect(
                    membershipManager.connect(nonOwner).setMinTokenThreshold(newThreshold)
                ).to.be.revertedWith("BlockToken:: Unauthorized User");
            });

            it("Should revert when user1 tries to set threshold", async function () {
                const { membershipManager, user1 } = await loadFixture(
                    deployMembershipManagerFixture
                );
                const newThreshold = hre.ethers.parseEther("2000");

                await expect(
                    membershipManager.connect(user1).setMinTokenThreshold(newThreshold)
                ).to.be.revertedWith("BlockToken:: Unauthorized User");
            });

            it("Should revert when user2 tries to set threshold", async function () {
                const { membershipManager, user2 } = await loadFixture(
                    deployMembershipManagerFixture
                );
                const newThreshold = hre.ethers.parseEther("2000");

                await expect(
                    membershipManager.connect(user2).setMinTokenThreshold(newThreshold)
                ).to.be.revertedWith("BlockToken:: Unauthorized User");
            });
        });

        describe("Owner Operations", function () {
            it("Should allow owner to set new threshold", async function () {
                const { membershipManager, owner } = await loadFixture(
                    deployMembershipManagerFixture
                );
                const newThreshold = hre.ethers.parseEther("2000");

                await expect(
                    membershipManager.connect(owner).setMinTokenThreshold(newThreshold)
                ).to.not.be.reverted;

                expect(await membershipManager.minTokenThreshold()).to.equal(
                    newThreshold
                );
            });

            it("Should allow owner to set threshold to zero", async function () {
                const { membershipManager, owner } = await loadFixture(
                    deployMembershipManagerFixture
                );

                await expect(
                    membershipManager.connect(owner).setMinTokenThreshold(0)
                ).to.not.be.reverted;

                expect(await membershipManager.minTokenThreshold()).to.equal(0);
            });

            it("Should allow owner to set very large threshold", async function () {
                const { membershipManager, owner } = await loadFixture(
                    deployMembershipManagerFixture
                );
                const largeThreshold = hre.ethers.parseEther("1000000000");

                await expect(
                    membershipManager.connect(owner).setMinTokenThreshold(largeThreshold)
                ).to.not.be.reverted;

                expect(await membershipManager.minTokenThreshold()).to.equal(
                    largeThreshold
                );
            });

            it("Should handle maximum uint256 values", async function () {
                const { membershipManager, owner } = await loadFixture(
                    deployMembershipManagerFixture
                );
                const maxUint256 = hre.ethers.MaxUint256;

                await expect(
                    membershipManager.connect(owner).setMinTokenThreshold(maxUint256)
                ).to.not.be.reverted;

                expect(await membershipManager.minTokenThreshold()).to.equal(
                    maxUint256
                );
            });
        });
    });

    describe("claimMembership", function () {
        describe("Validations", function () {
            it("Should revert when user has insufficient tokens", async function () {
                const { membershipManager, user2, accessToken } = await loadFixture(
                    deployWithTokenBalancesFixture
                );

                const user2Balance = await accessToken.balanceOf(user2.address);
                const threshold = await membershipManager.minTokenThreshold();
                expect(user2Balance).to.be.lt(threshold);

                await expect(
                    membershipManager.connect(user2).claimMembership()
                ).to.be.revertedWith("Insufficient token balance");
            });

            it("Should revert when user has zero tokens", async function () {
                const { membershipManager, nonOwner } = await loadFixture(
                    deployMembershipManagerFixture
                );

                await expect(
                    membershipManager.connect(nonOwner).claimMembership()
                ).to.be.revertedWith("Insufficient token balance");
            });

            it("Should revert when user has 1 wei less than required", async function () {
                const { membershipManager, nonOwner, accessToken, owner } = await loadFixture(
                    deployMembershipManagerFixture
                );

                const threshold = await membershipManager.minTokenThreshold();
                const almostEnough = threshold - 1n;

                // Mint almost enough tokens to nonOwner
                await accessToken.connect(owner).mint(almostEnough, nonOwner.address);

                await expect(
                    membershipManager.connect(nonOwner).claimMembership()
                ).to.be.revertedWith("Insufficient token balance");
            });

            it("Should revert after threshold is increased beyond user balance", async function () {
                const { membershipManager, user1, owner } = await loadFixture(
                    deployWithTokenBalancesFixture
                );


                const newThreshold = hre.ethers.parseEther("2000");
                await membershipManager.connect(owner).setMinTokenThreshold(newThreshold);


                await expect(
                    membershipManager.connect(user1).claimMembership()
                ).to.be.revertedWith("Insufficient token balance");
            });
        });

        describe("Successful Claims", function () {
            it("Should allow user with sufficient tokens to claim membership", async function () {
                const { membershipManager, user1, accessToken, blockNft } = await loadFixture(
                    deployWithTokenBalancesFixture
                );

                const user1Balance = await accessToken.balanceOf(user1.address);
                const threshold = await membershipManager.minTokenThreshold();
                expect(user1Balance).to.be.gte(threshold);

                const initialTokenId = await blockNft.tokenID();
                const initialBalance = await blockNft.balanceOf(user1.address);

                await expect(membershipManager.connect(user1).claimMembership())
                    .to.not.be.reverted;


                expect(await blockNft.tokenID()).to.equal(initialTokenId + 1n);
                expect(await blockNft.balanceOf(user1.address)).to.equal(initialBalance + 1n);
                expect(await blockNft.ownerOf(initialTokenId + 1n)).to.equal(user1.address);
            });

            it("Should allow user with exactly minimum tokens to claim membership", async function () {
                const { membershipManager, nonOwner, accessToken, blockNft, owner } = await loadFixture(
                    deployMembershipManagerFixture
                );


                const exactAmount = await membershipManager.minTokenThreshold();
                await accessToken.connect(owner).mint(exactAmount, nonOwner.address);

                const initialTokenId = await blockNft.tokenID();

                await expect(membershipManager.connect(nonOwner).claimMembership())
                    .to.not.be.reverted;

                expect(await blockNft.tokenID()).to.equal(initialTokenId + 1n);
                expect(await blockNft.ownerOf(initialTokenId + 1n)).to.equal(nonOwner.address);
            });

            it("Should work after threshold is decreased", async function () {
                const { membershipManager, user2, owner, blockNft } = await loadFixture(
                    deployWithTokenBalancesFixture
                );


                const newThreshold = hre.ethers.parseEther("400");
                await membershipManager.connect(owner).setMinTokenThreshold(newThreshold);

                const initialTokenId = await blockNft.tokenID();


                await expect(membershipManager.connect(user2).claimMembership())
                    .to.not.be.reverted;

                expect(await blockNft.tokenID()).to.equal(initialTokenId + 1n);
                expect(await blockNft.ownerOf(initialTokenId + 1n)).to.equal(user2.address);
            });

            it("Should work when threshold is set to zero", async function () {
                const { membershipManager, nonOwner, owner, blockNft } = await loadFixture(
                    deployMembershipManagerFixture
                );


                await membershipManager.connect(owner).setMinTokenThreshold(0);

                const initialTokenId = await blockNft.tokenID();


                await expect(membershipManager.connect(nonOwner).claimMembership())
                    .to.not.be.reverted;

                expect(await blockNft.tokenID()).to.equal(initialTokenId + 1n);
                expect(await blockNft.ownerOf(initialTokenId + 1n)).to.equal(nonOwner.address);
            });

            it("Should allow multiple users to claim if they have enough tokens", async function () {
                const { membershipManager, user1, nonOwner, accessToken, blockNft, owner } = await loadFixture(
                    deployWithTokenBalancesFixture
                );


                await accessToken.connect(owner).mint(
                    hre.ethers.parseEther("1500"),
                    nonOwner.address
                );

                const initialTokenId = await blockNft.tokenID();


                await expect(membershipManager.connect(user1).claimMembership())
                    .to.not.be.reverted;

                await expect(membershipManager.connect(nonOwner).claimMembership())
                    .to.not.be.reverted;

                expect(await blockNft.tokenID()).to.equal(initialTokenId + 2n);
                expect(await blockNft.ownerOf(initialTokenId + 1n)).to.equal(user1.address);
                expect(await blockNft.ownerOf(initialTokenId + 2n)).to.equal(nonOwner.address);
            });

            it("Should mint NFTs with sequential token IDs", async function () {
                const { membershipManager, user1, user2, owner, accessToken, blockNft } = await loadFixture(
                    deployWithTokenBalancesFixture
                );


                await membershipManager.connect(owner).setMinTokenThreshold(hre.ethers.parseEther("400"));

                const initialTokenId = await blockNft.tokenID();


                await membershipManager.connect(user1).claimMembership();
                const tokenId1 = initialTokenId + 1n;

                await membershipManager.connect(user2).claimMembership();
                const tokenId2 = initialTokenId + 2n;


                expect(await blockNft.ownerOf(tokenId1)).to.equal(user1.address);
                expect(await blockNft.ownerOf(tokenId2)).to.equal(user2.address);
                expect(await blockNft.tokenID()).to.equal(tokenId2);
            });
        });
    });

    describe("Integration Tests", function () {
        it("Should work with AccessToken burn functionality", async function () {
            const { membershipManager, user1, accessToken, blockNft, owner } = await loadFixture(
                deployWithTokenBalancesFixture
            );


            await expect(membershipManager.connect(user1).claimMembership())
                .to.not.be.reverted;


            await accessToken.connect(user1).burn(hre.ethers.parseEther("600"));


            const currentBalance = await accessToken.balanceOf(user1.address);
            expect(currentBalance).to.equal(hre.ethers.parseEther("900"));


            await expect(membershipManager.connect(user1).claimMembership())
                .to.be.revertedWith("Insufficient token balance");
        });

        it("Should work with AccessToken burnFrom functionality", async function () {
            const { membershipManager, user1, accessToken, owner } = await loadFixture(
                deployWithTokenBalancesFixture
            );


            await accessToken.connect(owner).burnFrom(user1.address, hre.ethers.parseEther("600"));


            await expect(membershipManager.connect(user1).claimMembership())
                .to.be.revertedWith("Insufficient token balance");
        });

        it("Should maintain state consistency across multiple operations", async function () {
            const { membershipManager, user1, user2, owner, accessToken, blockNft } = await loadFixture(
                deployWithTokenBalancesFixture
            );


            const initialTokenId = await blockNft.tokenID();
            expect(initialTokenId).to.equal(0);


            await membershipManager.connect(user1).claimMembership();
            expect(await blockNft.tokenID()).to.equal(1);


            await membershipManager.connect(owner).setMinTokenThreshold(hre.ethers.parseEther("400"));


            await membershipManager.connect(user2).claimMembership();
            expect(await blockNft.tokenID()).to.equal(2);


            await accessToken.connect(owner).mint(hre.ethers.parseEther("500"), user2.address);


            await membershipManager.connect(owner).setMinTokenThreshold(hre.ethers.parseEther("1200"));


            const user2Balance = await accessToken.balanceOf(user2.address);
            expect(user2Balance).to.equal(hre.ethers.parseEther("1000")); // 500 + 500

            await expect(membershipManager.connect(user2).claimMembership())
                .to.be.revertedWith("Insufficient token balance");
        });

        it("Should handle edge case with zero address checks", async function () {
            const [owner] = await hre.ethers.getSigners();


            const AccessToken = await hre.ethers.getContractFactory("AccessToken");
            await expect(
                AccessToken.deploy("AccessToken", "AT", hre.ethers.ZeroAddress)
            ).to.be.revertedWith("BlockToken:: Zero address not supported");
        });

        it("Should handle AccessToken mint and burn with zero amounts", async function () {
            const { accessToken, owner, user1 } = await loadFixture(
                deployMembershipManagerFixture
            );


            await expect(
                accessToken.connect(owner).mint(0, user1.address)
            ).to.be.revertedWith("BlockToken:: Zero amount not supported");


            await expect(
                accessToken.connect(user1).burn(0)
            ).to.be.revertedWith("BlockToken:: Zero amount not supported");


            await expect(
                accessToken.connect(owner).burnFrom(user1.address, 0)
            ).to.be.revertedWith("BlockToken:: Zero amount not supported");
        });
    });
});