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
      let ZeroAddress = "0x0000000000000000000000000000000000000000";
      const BlockTokenContract = await ethers.getContractFactory("BlockToken");
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
  });

  describe("Burning From", () => {
    it("Should only allow owner", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(10000, addr1);
      // expect(await BlockToken.balanceOf(addr1)).to.eq(10000);
      const authorizedUser = await BlockToken.connect(owner_).burnFrom(
        addr1,
        1000
      );
      expect(await BlockToken.balanceOf(addr1)).to.eq(9000);
      const unauthorizedUser = BlockToken.connect(addr1).burnFrom(addr1, 1000);
      await expect(unauthorizedUser).to.be.revertedWith(
        "BlockToken:: Unauthorized User"
      );
    });
    it("Should not send zero", async () => {
      const { BlockToken, addr1, owner_ } = await loadFixture(deployBlockToken);
      await expect(
        BlockToken.connect(owner_).burnFrom(addr1, 0)
      ).to.be.revertedWith("BlockToken:: Zero amount not supported");
    });
  });

  describe("Transfer", () => {
    it("should be called by owner", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(10000, owner_);
      await BlockToken.connect(owner_).transfer(addr1, 1000);
      const addrBalance = await BlockToken.balanceOf(addr1);
      const ownerBalance = await BlockToken.balanceOf(owner_);

      expect(addrBalance).to.eq(1000);
      expect(ownerBalance).to.eq(9000);
    });
    it("amount to be sent should be less than the balance of the sender", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).mint(10000, owner_);
      const ownerBalance = await BlockToken.balanceOf(owner_);
      expect(ownerBalance).to.be.greaterThanOrEqual(1000);
      await BlockToken.connect(owner_).transfer(addr1, 1000);
      const addrBalance = await BlockToken.balanceOf(addr1);
      const ownerBalanceAfter = await BlockToken.balanceOf(owner_);

      expect(addrBalance).to.eq(1000);
      expect(ownerBalanceAfter).to.eq(9000);
    });
    it("should revert if amount to be sent is greter than the amount the sender has", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await expect(BlockToken.connect(owner_).transfer(addr1, 10000)).to.be
        .reverted;
    });
    it("address 0 should not be the receiver", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      let ZeroAddress = "0x0000000000000000000000000000000000000000";
      await expect(BlockToken.connect(owner_).transfer(ZeroAddress, 1000)).to.be
        .reverted;
    });
  });

  describe("Approve", () => {
    it("address zero should not be the receiver", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      let ZeroAddress = "0x0000000000000000000000000000000000000000";
      await expect(BlockToken.connect(owner_).approve(ZeroAddress, 1000)).to.be
        .reverted;
    });
    it("should send moeny to allowances", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      await BlockToken.connect(owner_).approve(addr1, 1000);
      const allowance = await BlockToken.allowance(owner_, addr1);

      expect(allowance).to.eq(1000);
    });
    // it("address zero should not be the sender", async () => {
    //   const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
    //   let ZeroAddress = "0x0000000000000000000000000000000000000000";
    //   await expect(BlockToken.connect(ZeroAddress)).to.be.reverted;
    // });
  });
});
