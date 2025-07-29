
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// util functon
const deployBlockToken = async () => {
    // target the BlockToken contract within our contract folder
    let name_ = "BlockToken";
    let symbol_ = "BCT";
    const [owner_, addr1, addr2] = await ethers.getSigners();
    const BlockTokenContract = await ethers.getContractFactory("BlockToken"); // target BlockToken.sol
    const BlockToken = await BlockTokenContract.deploy(
        name_,
        symbol_,
        owner_.address
    ); // deploy the BlockToken contract
    return { BlockToken, owner_, addr1, addr2, name_, symbol_ }; // return the deployed instance of our BlockToken contract
};

// BlockToken Test Suite
describe("BlockToken Test Suite", () => {
    describe("Deployment", () => {
        it("Should return set values upon deployment", async () => {
            const { BlockToken, name_, symbol_, owner_ } = await loadFixture(
                deployBlockToken
            );
            expect(await BlockToken.name()).to.eq(name_);
            expect(await BlockToken.symbol()).to.eq(symbol_);
            expect(await BlockToken.owner()).to.eq(owner_);
        });

        it("Should revert if owner is zero address", async () => {
            const BlockTokenContract = await ethers.getContractFactory("BlockToken");
            let ZeroAddress = "0x0000000000000000000000000000000000000000";
            await expect(
                BlockTokenContract.deploy("hh", "tt", ZeroAddress)
            ).to.be.revertedWith("BlockToken:: Zero address not supported");
        });
    });

    describe("Minting", () => {
        it("Should allow onlyOwner Mint", async () => {
            const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
            //   test owner mints successfully
            await BlockToken.connect(owner_).mint(1000, addr1);
            expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

            // test that another user cant call successfully
            let malicioustxn = BlockToken.connect(addr1).mint(1000, addr1);
            await expect(malicioustxn).to.be.revertedWith(
                "BlockToken:: Unauthorized User"
            );
        });

        it("Should revert if minting amount is zero", async () => {
            const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
            await expect(
                BlockToken.connect(owner_).mint(0, addr1)
            ).to.be.revertedWith("BlockToken:: Zero amount not supported");
        });
    });

    describe("Burning", () => {
        describe("Burn Txn", () => {
            it("Should not burn if user doesn't have tokens", async () => {
                const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
                await expect(
                    BlockToken.connect(addr1).burn(1000)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
            });

            it("Should Burn Tokens Successfully", async () => {
                const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, owner_);
                expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

                await BlockToken.connect(owner_).burn(100);
                expect(await BlockToken.balanceOf(owner_)).to.eq(900);
            });

            it("Should revert if burning more than balance", async () => {
                const { BlockToken, owner_ } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, owner_);
                expect(await BlockToken.connect(owner_).balanceOf(owner_)).to.eq(1000);

                await expect(BlockToken.connect(owner_).burn(2000)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
            });

            it("Should revert if burning zero balance", async () => {
                const { BlockToken, owner_ } = await loadFixture(deployBlockToken);
                await expect(BlockToken.connect(owner_).burn(0)).to.be.revertedWith("BlockToken:: Zero amount not supported")
            })
        });

        describe("BurningFrom", () => {
            it("Should Burn From User's Tokens Successfully", async () => {
                const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, owner_);
                expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

                await BlockToken.connect(owner_).transfertk(addr1, 200);
                expect(await BlockToken.balanceOf(owner_)).to.eq(800);

                await BlockToken.connect(owner_).burnFrom(addr1, 50);
                expect(await BlockToken.balanceOf(addr1)).to.eq(150);
            })

            it("Should revert if User burns more than balance", async () => {
                const { BlockToken, owner_ } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, owner_);
                await expect(BlockToken.connect(owner_).burn(2000)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance")
            });

            it("Should revert if burning from address zero", async () => {
                const { BlockToken, owner_ } = await loadFixture(deployBlockToken);
                let ZeroAddress = "0x0000000000000000000000000000000000000000";
                await BlockToken.connect(owner_).mint(1000, owner_);
                expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

                await expect(BlockToken.connect(owner_).burnFrom(ZeroAddress, 50)).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidSender");
            });

            it("Should revert if burnining called by different address", async () => {
                const { BlockToken, addr2, addr1 } = await loadFixture(deployBlockToken);
                let malicioustxn = BlockToken.connect(addr1).burnFrom(addr2, 1000);
                await expect(malicioustxn).to.be.revertedWith("BlockToken:: Unauthorized User");
            });
        });

    });

    describe("Transferring", () => {
        describe("Transfer txn", () => {
            it("Should not transfer if user doesn't have tokens", async () => {
                const { BlockToken, addr1, addr2 } = await loadFixture(deployBlockToken);
                await expect(BlockToken.connect(addr1).transfer(addr2, 100)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
            })

            it("Should Transfer Successfully", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, owner_);
            await BlockToken.connect(owner_).transfertk(addr1, 500);
                expect(await BlockToken.balanceOf(owner_)).to.eq(500);
                expect(await BlockToken.balanceOf(addr1)).to.eq(500);

            await BlockToken.connect(addr1).transfertk(addr2, 300);
                expect(await BlockToken.balanceOf(addr1)).to.eq(200);
                expect(await BlockToken.balanceOf(addr2)).to.eq(300);
            });

            it("Should revert if tranferring to zero address", async () => {
                const { BlockToken, owner_ } = await loadFixture(deployBlockToken);
                let ZeroAddress = "0x0000000000000000000000000000000000000000";
                await BlockToken.connect(owner_).mint(1000, owner_);

            await expect(BlockToken.connect(owner_).transfertk(ZeroAddress, 300)).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
            });

            it("Should revert if tranferring more than balance", async () => {
                const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, owner_);
            await expect(BlockToken.connect(owner_).transfertk(addr1, 2000)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
            });

        });

        describe("TransferFrom Txn", () => {
            it("Should revert if owner address doesn't have tokens", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(addr1).approveTxn(addr2, 1000);
                await expect(BlockToken.connect(addr2).transferFromtk(addr1, owner_, 50)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
            });

            it("Should revert when transfering zero tokens", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken)
                await BlockToken.connect(addr1).approveTxn(addr2, 1000)
                await expect(BlockToken.connect(addr2).transferFromtk(addr1, owner_, 0)).to.be.revertedWith("BlockToken:: Zero amount not supported");
            });

            it("Should revert when transfering more than balance", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, addr1);
                await BlockToken.connect(addr1).approveTxn(addr2, 3000)
                await expect(BlockToken.connect(addr2).transferFromtk(addr1, owner_, 2000)).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
            });

            it("Should revert if transfering to address zero", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                let ZeroAddress = "0x0000000000000000000000000000000000000000";
                await BlockToken.connect(owner_).mint(1000, addr1);
                await BlockToken.connect(addr1).approveTxn(addr2, 1000)
                await expect(BlockToken.connect(addr2).transferFromtk(addr1, ZeroAddress, 500)).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
            });

            it("Should Transfer Tokens Successfully Using TranasferFrom", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, addr1);
                await BlockToken.connect(addr1).approveTxn(addr2, 1000)

                await BlockToken.connect(addr2).transferFromtk(addr1, addr2, 400);

                expect(await BlockToken.balanceOf(addr1)).to.eq(600);
                expect(await BlockToken.balanceOf(addr2)).to.eq(400);

            });
        });
    });

    describe("Approvals", () => {
        describe("Approve", () => {
            it("Should revert when approving zero tokens", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                await BlockToken.connect(owner_).mint(1000, addr1);
                await expect(BlockToken.connect(addr1).approveTxn(addr2, 0)).to.be.revertedWith("BlockToken:: Zero amount not supported");
            });

            it("Should revert if approving to address zero", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
                let ZeroAddress = "0x0000000000000000000000000000000000000000";

                await BlockToken.connect(owner_).mint(500, addr1)
                await expect(BlockToken.connect(addr1).approveTxn(ZeroAddress, 50)).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidSpender");
            });

            it("Should Approve Tokens Successfully", async () => {
                const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);

                await BlockToken.connect(addr1).approveTxn(addr2, 300);
                expect(await BlockToken.allowance(addr1, addr2)).to.eq(300);
            });
        });
    })
});
