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
  const [owner_, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  const BlockTokenContract = await ethers.getContractFactory("BlockToken"); // target BlockToken.sol
  const BlockToken = await BlockTokenContract.deploy(
    name_,
    symbol_,
    owner_.address
  ); // deploy the BlockToken contract
  return { BlockToken, owner_, addr1, addr2, addr3, addr4, name_, symbol_ }; // return the deployed instance of our BlockToken contract
};

// BlockToken Test Suite
describe("BlockToken Test Suite", () => {
  describe("Deployment", () => {
    it("Should return set values upon deployment", async () => {
      const { BlockToken, name_, symbol_, owner_ } = await loadFixture(
        deployBlockToken
      );
      // console.log(_owner.address);
      expect(await BlockToken.name()).to.eq(name_);
      expect(await BlockToken.symbol()).to.eq(symbol_);
      expect(await BlockToken.owner()).to.eq(owner_.address);
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
    it("Should not burn if user doesn't have tokens", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);

      await expect(
        BlockToken.connect(addr1).burn(1000)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
    });

    it("Should burn tokens successfully", async () => {
      const { BlockToken, owner_ } = await loadFixture(deployBlockToken);

      await BlockToken.connect(owner_).mint(1000, owner_);
      const balance = await BlockToken.balanceOf(owner_);
      expect(balance).to.eq(1000);

      await BlockToken.connect(owner_).burn(100);
      const balance2 = await BlockToken.balanceOf(owner_);
      expect(balance2).to.eq(900);

      await BlockToken.connect(owner_).burn(800);
      const balance3 = await BlockToken.balanceOf(owner_);
      expect(balance3).to.eq(100);
    });

    describe("Burn From", () => {
      it("Should allow only owner to burnFrom", async () => {
        const { BlockToken, owner_, addr1, addr2 } = await loadFixture( deployBlockToken);

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        // Check if address 1 can burn from his address
        await expect(BlockToken.connect(addr1).burnFrom(addr1, 800)).to.be.revertedWith("BlockToken:: Unauthorized User");

        await BlockToken.connect(owner_).mint(900, addr2);
        expect(await BlockToken.balanceOf(addr2)).to.eq(900);

        // Check if address 1 can burn from another address
        await expect(
        BlockToken.connect(addr1).burnFrom(addr2, 800)
        ).to.be.revertedWith("BlockToken:: Unauthorized User");

        // Check if owner can burn from successfully
       await BlockToken.connect(owner_).burnFrom(addr1, 200);

        const balance = await BlockToken.balanceOf(addr1);
        expect(balance).to.eq(800);
      });

      it("Should not burn zero amount", async () => {
        const { BlockToken, owner_, addr1 } = await loadFixture( deployBlockToken );

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await expect(
        BlockToken.connect(owner_).burnFrom(addr1, 0)
        ).to.be.revertedWith("BlockToken:: Zero amount not supported");
      });
    });
  });
    

  describe("Transactions", () => {
    describe("Transfers", () => {
      it("Should transfer tokens from one account to another", async () => {
        const { BlockToken, owner_, addr1, addr2 } = await loadFixture(
          deployBlockToken
        );

        const zeroAddress = "0x0000000000000000000000000000000000000000";

        // Transfer to zero address
        await expect(BlockToken.connect(owner_).transfer(zeroAddress, 800)).to
          .be.reverted;

        await BlockToken.connect(owner_).mint

        await BlockToken.connect(owner_).mint(1000, owner_);
        expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

        // Transfer from owner to other account
        await BlockToken.connect(owner_).transfer(addr1, 800);
        expect(await BlockToken.balanceOf(owner_)).to.eq(200);
        expect(await BlockToken.balanceOf(addr1)).to.eq(800);

        // Transfer from account to account
        await BlockToken.connect(addr1).transfer(addr2, 400);
        expect(await BlockToken.balanceOf(addr1)).to.eq(400);
        expect(await BlockToken.balanceOf(addr2)).to.eq(400);

        await BlockToken.connect(addr2).transfer(addr1, 200);
        expect(await BlockToken.balanceOf(addr1)).to.eq(600);
        expect(await BlockToken.balanceOf(addr2)).to.eq(200);
      });

      it("Should transfer tokens less than or equal to balance", async () => {
        const { BlockToken,owner_, addr1 } = await loadFixture(deployBlockToken);

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await expect(
          BlockToken.connect(owner_).transfer(addr1, 100)
        ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
        expect(await BlockToken.balanceOf(owner_)).to.eq(0);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).transfer(owner_, 1000);
        expect(await BlockToken.balanceOf(owner_)).to.eq(1000);
        expect(await BlockToken.balanceOf(addr1)).to.eq(0);
        
      });

    describe("Transfer From", () => {
      it("Should approve for transferFrom function", async () => {
        const { BlockToken,owner_, addr1 } = await loadFixture(deployBlockToken);

        await BlockToken.connect(owner_).mint(1000, owner_);
        expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

        await BlockToken.connect(owner_).approve(addr1, 500);
        expect(await BlockToken.allowance(owner_, addr1)).to.eq(500);
      });

      it("Should transferFrom based on approve and allowance", async () => {
        const { BlockToken, owner_, addr4, addr2 } = await loadFixture(
          deployBlockToken
        );

        await BlockToken.connect(owner_).mint(1000, addr4);
        expect(await BlockToken.balanceOf(addr4)).to.eq(1000);

        await BlockToken.connect(addr4).approve(owner_, 600);
        expect(await BlockToken.connect(addr4).allowance(addr4, owner_)).to.eq(
          600
        );
        await BlockToken.connect(owner_).transferFrom(addr4, addr2, 400);

        expect(await BlockToken.connect(addr2).balanceOf(addr2)).to.eq(400);
      });

      it("Should revert if balance of 'from' is insufficient", async () => {
        const { BlockToken,owner_, addr4, addr2 } = await loadFixture(
          deployBlockToken
        );

        await BlockToken.connect(owner_).mint(1000, addr4);
        expect(await BlockToken.balanceOf(addr4)).to.eq(1000);

        await BlockToken.connect(addr4).approve(owner_, 500);
        expect(await BlockToken.connect(addr4).allowance(addr4, owner_)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(owner_).transferFrom(addr4, addr2, 700)
        ).to.be.revertedWithCustomError(
          BlockToken,
          "ERC20InsufficientAllowance"
        );
       });

      it("Should revert if balance of 'from' is insufficient", async () => {
        const { BlockToken, owner_, addr4, addr2 } = await loadFixture(
          deployBlockToken
        );

        await BlockToken.connect(owner_).mint(1000, addr4);
        expect(await BlockToken.balanceOf(addr4)).to.eq(1000);

        await BlockToken.connect(addr4).approve(owner_, 500);
        expect(await BlockToken.connect(addr4).allowance(addr4, owner_)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(owner_).transferFrom(addr4, addr2, 700)
        ).to.be.revertedWithCustomError(
          BlockToken,
          "ERC20InsufficientAllowance"
        );
      });

      it("Should revert if allowance is zero for spender", async () => {
        const { BlockToken, owner_, addr4, addr2 } = await loadFixture(
          deployBlockToken
        );

        await BlockToken.connect(owner_).mint(1000, addr4);
        expect(await BlockToken.balanceOf(addr4)).to.eq(1000);

        await BlockToken.connect(addr4).approve(owner_, 0);
        expect(await BlockToken.connect(addr4).allowance(addr4, owner_)).to.eq(
          0
        );
        await expect(
          BlockToken.connect( owner_).transferFrom(addr4, addr2, 700)
        ).to.be.revertedWithCustomError(
          BlockToken,
          "ERC20InsufficientAllowance"
        );
      });

      it("Should revert if 'to' is address zero", async () => {
        const { BlockToken, owner_, addr1, addr2 } = await loadFixture(
          deployBlockToken
        );
        const zeroAddress = "0x0000000000000000000000000000000000000000";

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(owner_, 500);
        expect(await BlockToken.connect(addr1).allowance(addr1, owner_)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(owner_).transferFrom(addr1, zeroAddress, 400)
        ).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
      });

      it("Should revert if allowance is incremented and not replaced", async () => {
        const { BlockToken, owner_, addr1, addr2 } = await loadFixture(
          deployBlockToken
        );

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(owner_, 500);

        await BlockToken.connect(addr1).approve(owner_, 700);
        expect(await BlockToken.connect(addr1).allowance(addr1, owner_)).to.eq( 700 );
       });
    });
  });
});    
});
