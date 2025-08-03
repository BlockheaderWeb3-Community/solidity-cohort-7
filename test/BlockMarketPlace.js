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
  let name_ = "BlockToken";
  let symbol_ = "BCT";
  const BlockToken = await BlockTokenContract.deploy(
    name_,
    symbol_,
    owner_.address
  ); // deploy the BlockToken contract
  const blocknft = await BlockNftContract.deploy();
  const marketplace = await BlockMarketPlaceContract.connect(owner_).deploy();
  // deploy the BlockMarketPlace contract
  return { marketplace, blocknft, BlockToken, owner_, addr1, addr2 }; // return the deployed instance of our BlockMarketPlace contract
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

    });});

    describe("Buy NFT", () => {
    it("Should allow a user to buy a listed NFT with ERC20", async () => {
    const { marketplace, blocknft, BlockToken, addr1, addr2, owner_ } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);

    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId,
      paymentToken: BlockToken,
      NftToken: blocknft.getAddress(),
      isNative: false,
      price: 100,
      sold: false,
      minOffer: 10,
    });

    await BlockToken.connect(owner_).mint(200, owner_);
    await BlockToken.connect(owner_).transfer(addr2.address, 100);
    await BlockToken.connect(addr2).approve(marketplace.getAddress(), 100);

    await marketplace.connect(addr2).buyNft(0);

    expect(await blocknft.ownerOf(tokenId)).to.equal(addr2.address);
    expect((await marketplace.getListing(0)).sold).to.equal(true);
  });
});

describe("Offer", () => {
  it("Should allow a user to make an offer with ERC20", async () => {
    const { marketplace, blocknft, BlockToken, addr1, addr2, owner_ } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);

    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId,
      paymentToken: BlockToken,
      NftToken: blocknft.getAddress(),
      isNative: false,
      price: 100,
      sold: false,
      minOffer: 10,
    });

    await BlockToken.connect(owner_).mint(200, owner_);
    await BlockToken.connect(owner_).transfer(addr2.address, 50);
    await BlockToken.connect(addr2).approve(marketplace.getAddress(), 50);

    await marketplace.connect(addr2).offer(0, 20);

    const offer = await marketplace.getOffer(0);
    expect(offer.offerAmount).to.equal(20);
    expect(offer.offerrer).to.equal(addr2.address);
  });
});

describe("Accept Offer", () => {
  it("Should allow the owner to accept an offer", async () => {
    const { marketplace, blocknft, BlockToken, addr1, addr2, owner_ } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);

    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId,
      paymentToken: BlockToken,
      NftToken: blocknft.getAddress(),
      isNative: false,
      price: 100,
      sold: false,
      minOffer: 10,
    });

    await BlockToken.connect(owner_).mint(200, owner_);
    await BlockToken.connect(owner_).transfer(addr2.address, 50);
    await BlockToken.connect(addr2).approve(marketplace.getAddress(), 50);

    await marketplace.connect(addr2).offer(0, 20);

    await marketplace.connect(addr1).acceptOffer(0);

    expect(await blocknft.ownerOf(tokenId)).to.equal(addr2.address);
    expect((await marketplace.getListing(0)).sold).to.equal(true);
  });
});

describe("Cancel Offer", () => {
  it("Should allow the offerer to cancel their offer", async () => {
    const { marketplace, blocknft, BlockToken, addr1, addr2, owner_ } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);

    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId,
      paymentToken: BlockToken,
      NftToken: blocknft.getAddress(),
      isNative: false,
      price: 100,
      sold: false,
      minOffer: 10,
    });

    await BlockToken.connect(owner_).mint(200, owner_);
    await BlockToken.connect(owner_).transfer(addr2.address, 50);
    await BlockToken.connect(addr2).approve(marketplace.getAddress(), 50);

    await marketplace.connect(addr2).offer(0, 20);

    await marketplace.connect(addr2).cancelOffer(0);

    const offer = await marketplace.getOffer(0);
    expect(offer.offerrer).to.equal(ethers.constants.AddressZero);
  });
});

describe("Cancel Listing", () => {
  it("Should allow the owner to cancel their listing", async () => {
    const { marketplace, blocknft, BlockToken, addr1 } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);

    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId,
      paymentToken: BlockToken,
      NftToken: blocknft.getAddress(),
      isNative: false,
      price: 100,
      sold: false,
      minOffer: 10,
    });

    await marketplace.connect(addr1).cancelListing(0);

    const listing = await marketplace.getListing(0);
    expect(listing.owner).to.equal(ethers.constants.AddressZero);
    expect(await blocknft.ownerOf(tokenId)).to.equal(addr1.address);
      });
    });
}); 