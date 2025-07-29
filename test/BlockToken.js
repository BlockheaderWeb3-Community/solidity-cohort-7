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
    it("Should not burn if user doesn't have tokens", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await expect(
        BlockToken.connect(addr1).burn(1000)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
    });

    it("Should Burn Tokens Successfully", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, owner_);
      expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

      await BlockToken.connect(owner_).burn(100);
      expect(await BlockToken.balanceOf(owner_)).to.eq(900);
    });
      it("Should allow only owner to burnFrom", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, addr1);
      await expect(BlockToken.connect(addr1).burnFrom(addr1, 1000)).to.be.revertedWith(
        "BlockToken:: Unauthorized User"
      );
    });
    it("Should allow onlyOwner burn", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      //   test owner mints successfully
      await BlockToken.connect(owner_).mint(1000, addr1);
      expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

      // test that another user cant call successfully
      let malicioustxn = BlockToken.connect(addr1).burnFrom(addr1, 1000);
      await expect(malicioustxn).to.be.revertedWith(
        "BlockToken:: Unauthorized User"
      );
    });
    
  });


 describe("burnFrom", () => {
    it("Should burn tokens from another account", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(owner_).burnFrom(addr1, 500);
      expect(await BlockToken.balanceOf(addr1)).to.eq(500);
    });

    it("Should revert if account has insufficient tokens", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await expect(BlockToken.connect(owner_).burnFrom(addr1, 500)).to.be.revertedWithCustomError(
        BlockToken,
        "ERC20InsufficientBalance"
      );
    });

    it("Should revert if burning zero from address", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, addr1);
      await expect(BlockToken.connect(owner_).burnFrom(addr1, 0)).to.be.revertedWith(
        "BlockToken:: Zero amount not supported"
      );
    });
  });

  describe("Transfers", () => {
    it("Should transfer tokens successfully", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, owner_);
      await BlockToken.connect(owner_).transfer(addr1.address, 500);
      expect(await BlockToken.balanceOf(owner_)).to.eq(500);
      expect(await BlockToken.balanceOf(addr1)).to.eq(500);
    });

    it("Should revert transfer to zero address", async () => {
      const { BlockToken, owner_ } = await loadFixture(deployBlockToken);
          const zeroAddress = "0x0000000000000000000000000000000000000000"
      await BlockToken.connect(owner_).mint(1000, owner_);
      await expect(
        BlockToken.connect(owner_).transfer(zeroAddress, 800)
      ).to.be.reverted;
    });

    it("Should revert transferFrom if allowance is insufficient", async () => {
      const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).approve(owner_, 500);
      await expect(
        BlockToken.connect(owner_).transferFrom(addr1, addr2, 700)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientAllowance");
    });

    it("Should revert transferFrom to zero address", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
           const zeroAddress = "0x0000000000000000000000000000000000000000"
      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).approve(owner_, 500);
      await expect(
        BlockToken.connect(owner_).transferFrom(addr1, zeroAddress, 400)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
    });

    it("Should approve and update allowance", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, owner_);
      await BlockToken.connect(owner_).approve(addr1, 500);
      await BlockToken.connect(owner_).approve(addr1, 700);
      expect(await BlockToken.allowance(owner_, addr1)).to.eq(700);
    });

    it("Should execute transferFrom properly", async () => {
      const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).approve(owner_, 500);
      await BlockToken.connect(owner_).transferFrom(addr1, addr2, 400);
      expect(await BlockToken.balanceOf(addr2)).to.eq(400);
    });
  });
});