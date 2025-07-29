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
  });

  describe("BurnFrom", () => {
    it("Should allow owner to burn tokens from user with sufficient balance", async () =>{
        const {BlockToken, owner_, addr1} = await loadFixture(deployBlockToken);
        //mint 1000 tokens to addr1
        await BlockToken.connect(owner_).mint(1000, addr1.address);
        expect(await BlockToken.balanceOf(addr1.address)).to.eq(1000);

        //owner burns 300 tokes from addr1
        await BlockToken.connect(owner_).burnFrom(addr1.address, 300);
        expect(await BlockToken.balanceOf(addr1.address)).to.eq(700);
    });

    it("should revert if non-owner tries to burn tokens", async() => {
        const {BlockToken, owner_, addr1, addr2} = await loadFixture(deployBlockToken);
        //mint 1000 tokens to addr1
        await BlockToken.connect(owner_).mint(1000, addr1.address);
        expect(await BlockToken.balanceOf (addr1.address)).to.eq(1000);

        //non-user tries to burn tokens from addr1
        await expect (BlockToken.connect(addr2).burnFrom(addr1.address, 300)).to.be.revertedWith("BlockToken:: Unauthorized User"

        );
    });

    it("Should revert if burning zero amount", async () => {
        const {BlockToken, owner_, addr1} = await loadFixture (deployBlockToken);
        //mint 1000 tokens to addr1
        await BlockToken.connect(owner_).mint(1000, addr1.address);

        //owner tries to burn 0 tokens from addr1
        await expect (BlockToken.connect(owner_).burnFrom(addr1.address, 0)).to.be.revertedWith("BlockToken:: Zero amount not supported"

        );
    });

    it("Should revert if user has insufficient balance", async () => {
      const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
      // Mint 500 tokens to addr1
      await BlockToken.connect(owner_).mint(500, addr1.address);
      expect(await BlockToken.balanceOf(addr1.address)).to.eq(500);

      // Owner tries to burn 600 tokens from addr1
      await expect(
        BlockToken.connect(owner_).burnFrom(addr1.address, 600)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
    });
  })
  
  describe("Transfer", () => {
  it("Should allow user to transfer tokens with sufficient balance", async () => {
    const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
    // Mint 1000 tokens to addr1
    await BlockToken.connect(owner_).mint(1000, addr1.address);
    expect(await BlockToken.balanceOf(addr1.address)).to.eq(1000);
    expect(await BlockToken.balanceOf(addr2.address)).to.eq(0);

    // addr1 transfers 300 tokens to addr2
    await BlockToken.connect(addr1).transfer(addr2.address, 300);
    expect(await BlockToken.balanceOf(addr1.address)).to.eq(700);
    expect(await BlockToken.balanceOf(addr2.address)).to.eq(300);
  });

  it("Should emit Transfer event on successful transfer", async () => {
    const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
    // Mint 1000 tokens to addr1
    await BlockToken.connect(owner_).mint(1000, addr1.address);

    // addr1 transfers 300 tokens to addr2
    await expect(BlockToken.connect(addr1).transfer(addr2.address, 300))
      .to.emit(BlockToken, "Transfer")
      .withArgs(addr1.address, addr2.address, 300);
  });

  it("Should revert if sender has insufficient balance", async () => {
    const { BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockToken);
    // Mint 500 tokens to addr1
    await BlockToken.connect(owner_).mint(500, addr1.address);
    expect(await BlockToken.balanceOf(addr1.address)).to.eq(500);

    // addr1 tries to transfer 600 tokens to addr2
    await expect(
      BlockToken.connect(addr1).transfer(addr2.address, 600)
    ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
  });

  it("Should revert if transferring to zero address", async () => {
    const { BlockToken, owner_, addr1 } = await loadFixture(deployBlockToken);
    // Mint 1000 tokens to addr1
    await BlockToken.connect(owner_).mint(1000, addr1.address);

    // addr1 tries to transfer 300 tokens to zero address
    await expect(
      BlockToken.connect(addr1).transfer("0x0000000000000000000000000000000000000000", 300)
    ).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
  });
});
});