const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { bigint } = require("hardhat/internal/core/params/argumentTypes");

// util functon
const deployBlockMarketPlace = async () => {
  // target the BlockMarketPlace contract within our contract folder
  const [owner_, addr1, addr2] = await ethers.getSigners();
  const BlockMarketPlaceContract = await ethers.getContractFactory(
    "BlockMarketPlace"
  ); // target BlockMarketPlace.sol
  const BlockNftContract = await ethers.getContractFactory("BlockNft");
  const BlockTokenContract = await ethers.getContractFactory("BlockToken");
  const MockOwnerContract = await ethers.getContractFactory("MockOwner");
  let name_ = "BlockToken";
  let symbol_ = "BCT";
  const BlockToken = await BlockTokenContract.deploy(
    name_,
    symbol_,
    owner_.address
  ); // deploy the BlockToken contract
  const oneEther = ethers.parseEther("1");
  let ZeroAddress = "0x0000000000000000000000000000000000000000";
  const blocknft = await BlockNftContract.deploy();
  const marketplace = await BlockMarketPlaceContract.connect(owner_).deploy();
  const mockowner = await MockOwnerContract.deploy(marketplace, blocknft);
  // deploy the BlockMarketPlace contract
  return {
    marketplace,
    blocknft,
    BlockToken,
    owner_,
    addr1,
    addr2,
    oneEther,
    ZeroAddress,
    mockowner,
  }; // return the deployed instance of our BlockMarketPlace contract
};

describe("BlockMarketPlace Test Suite", () => {
  describe("Deployment", () => {
    it("Should return set values upon deployment", async () => {
      const { marketplace, owner_ } = await loadFixture(deployBlockMarketPlace);
      expect(await marketplace.marketOwner()).to.eq(owner_);
    });
  });

  describe("Listing", () => {
    it("Should list Nft accordingly", async () => {
      const { marketplace, addr1, BlockToken, blocknft } = await loadFixture(
        deployBlockMarketPlace
      );
      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100000,
        sold: false,
        minOffer: 10,
      });

      expect(await blocknft.ownerOf(tokenId)).to.eq(
        await marketplace.getAddress()
      );
    });

    it("Should revert upon setting unaccepted values", async () => {
      const { marketplace, addr1, BlockToken, blocknft } = await loadFixture(
        deployBlockMarketPlace
      );
      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      let tx1 = marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 0,
        sold: false,
        minOffer: 10,
      });

      await expect(tx1).to.be.revertedWith("Invalid price");
      //   tx2
      let tx2 = marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 10000,
        sold: false,
        minOffer: 0,
      });

      await expect(tx2).to.be.revertedWith("Invalid min offer");

      //   tx3
      let tx3 = marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 10000,
        sold: false,
        minOffer: 10,
      });

      await expect(tx3).to.be.revertedWith("ERC20 Payment is not supported");

      let ZeroAddress = "0x0000000000000000000000000000000000000000";
      marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 10000,
        sold: false,
        minOffer: 10,
      });

      let [, , paymentToken, , ,] = await marketplace.getListing(1);
      console.log(paymentToken);

      expect(await paymentToken).to.eq(ZeroAddress);
    });
  });

  describe("Buying", () => {
    it("Should buy nft successfully", async () => {
      const {
        marketplace,
        blocknft,
        BlockToken,
        owner_,
        addr1,
        addr2,
        oneEther,
      } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100000,
        sold: false,
        minOffer: 10,
      });
      // mint tokens to buy nft
      await BlockToken.connect(owner_).mint(oneEther, addr2);
      await BlockToken.connect(addr2).approve(
        marketplace.getAddress(),
        oneEther
      );
      // buy the nft
      await marketplace.connect(addr2).buyNft(0);
    });
    it("Should revert if already sold", async () => {
      const {
        marketplace,
        blocknft,
        BlockToken,
        owner_,
        addr1,
        addr2,
        oneEther,
      } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100000,
        sold: false,
        minOffer: 10,
      });
      // mint tokens to buy nft
      await BlockToken.connect(owner_).mint(oneEther, addr2);
      await BlockToken.connect(addr2).approve(
        marketplace.getAddress(),
        oneEther
      );
      // buy the nft
      await marketplace.connect(addr2).buyNft(0);

      await expect(marketplace.connect(addr2).buyNft(0)).to.be.revertedWith(
        "ALready Sold"
      );
    });

    it("Should buy successfully with native value", async () => {
      const {
        marketplace,
        blocknft,
        BlockToken,
        owner_,
        addr1,
        addr2,
        oneEther,
        ZeroAddress,
      } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100000,
        sold: false,
        minOffer: 10,
      });
      // buy the nft
      await marketplace.connect(addr2).buyNft(0, { value: 100000 });
    });
    it("Should revert if native price is incorrect", async () => {
      const {
        marketplace,
        blocknft,
        BlockToken,
        owner_,
        addr1,
        addr2,
        oneEther,
        ZeroAddress,
      } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100000,
        sold: false,
        minOffer: 10,
      });
      // buy the nft
      await expect(
        marketplace.connect(addr2).buyNft(0, { value: 10000 })
      ).to.be.revertedWith("Incorrect price");
    });

    it("Should revert if transfers failed", async () => {
      const {
        marketplace,
        blocknft,
        BlockToken,
        owner_,
        addr1,
        addr2,
        oneEther,
        ZeroAddress,
        mockowner,
      } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;

      await mockowner.callList({
        owner: mockowner.getAddress(),
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100000,
        sold: false,
        minOffer: 10,
      });
      // buy the nft
      await expect(
        marketplace.connect(addr2).buyNft(0, { value: 100000 })
      ).to.be.revertedWith("Owner transfer failed");

      // change market owner
      await marketplace.connect(owner_).changeOwner(mockowner.getAddress());

      let tokenId2 = 2;
      await blocknft.connect(addr1).mint(addr1);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: mockowner.getAddress(),
        tokenId: tokenId2,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100000,
        sold: false,
        minOffer: 10,
      });

      await expect(
        marketplace.connect(addr2).buyNft(1, { value: 100000 })
      ).to.be.revertedWith("MarketOwner Transfer failed");
    });

    it("should trigger the fallback", async () => {
      const {
        marketplace,
        blocknft,
        BlockToken,
        owner_,
        addr1,
        addr2,
        oneEther,
        ZeroAddress,
        mockowner,
      } = await loadFixture(deployBlockMarketPlace);

      await expect(
        marketplace.callAnything(mockowner.getAddress())
      ).to.be.revertedWith("Call failed");

      await marketplace.callname(mockowner.getAddress());

      expect(await mockowner.Name()).to.eq("gregory");
    });
  });
});
