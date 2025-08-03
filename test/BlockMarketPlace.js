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
  const [owner_, addr1, addr2, addr3] = await ethers.getSigners();
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
  return { marketplace, blocknft, BlockToken, owner_, addr1, addr2, addr3 }; // return the deployed instance of our BlockMarketPlace contract
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
      // console.log(paymentToken);

      expect(await paymentToken).to.eq(ZeroAddress);
    });
  });

  describe("Cancel Listing", () => {
    it("Should cancel listing", async () => {
      const { marketplace, addr1, BlockToken, blocknft } = await loadFixture(
        deployBlockMarketPlace
      );
      let tokenId = 1;
      let listId = 0;
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

      await marketplace.connect(addr1).cancelListing(listId);
    });

    it("Should revert when unauthorized user cancel's listing", async () => {
      const { marketplace, addr1, BlockToken, blocknft, addr2 } =
        await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
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
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await expect(
        marketplace.connect(addr2).cancelListing(listId)
      ).to.be.revertedWith("Unauthorized user");
    });

    it("Should revert if already sold", async () => {
      const { marketplace, addr1, BlockToken, blocknft, addr2, owner_ } =
        await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
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
        price: 100,
        sold: true,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr2.address, 500);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);

      await marketplace.connect(addr2).buyNft(listId);

      await expect(
        marketplace.connect(addr1).cancelListing(listId)
      ).to.be.revertedWith("Already sold");
    });
  });

  describe("Buy Nft", () => {
    it("Should buy successfully with tokens", async () => {
      const { marketplace, addr1, BlockToken, blocknft, addr2, owner_ } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      // let price = 1000;
      let listId = 0;

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(2000, owner_); // mint token to owner addr
      await BlockToken.connect(owner_).transfer(addr2.address, 1000); // transfer token to addr2
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000); // approve marketplace to spend tokens
      expect(await BlockToken.balanceOf(addr2.address)).to.eq(1000); // check token balance of addr2

      await marketplace.connect(addr2).buyNft(listId);
      expect(await blocknft.ownerOf(tokenId)).to.eq(addr2.address);
      expect((await marketplace.getListing(listId)).sold).to.equal(true);

      // listId is 0, not 1
    });

    it("Should buy successfully with native", async () => {
      const { marketplace, addr1, BlockToken, blocknft, addr2, owner_ } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let ZeroAddress = "0x0000000000000000000000000000000000000000";
      let listId = 0;

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).buyNft(listId, { value: 100 });
      expect(await blocknft.ownerOf(tokenId)).to.eq(addr2.address);
      expect((await marketplace.getListing(listId)).sold).to.equal(true);
    });

    it("Should revert upon setting invalid price", async () => {
      const { marketplace, addr1, BlockToken, blocknft, addr2, owner_ } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await expect(
        marketplace.connect(addr2).buyNft(listId, { value: 50 })
      ).to.be.revertedWith("Incorrect price");
      expect((await marketplace.getListing(listId)).sold).to.equal(false);
    });

    it("Should revert if already sold", async () => {
      const { marketplace, addr1, BlockToken, blocknft, addr2, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: true,
        minOffer: 10,
      });

      await marketplace.connect(addr2).buyNft(listId, { value: 100 });
      expect((await marketplace.getListing(listId)).sold).to.equal(true);
      await expect(
        marketplace.connect(addr3).buyNft(listId, { value: 100 })
      ).to.be.revertedWith("Already Sold");
    });
  });

  describe("Offer", () => {
    it("Should make offer with native", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_ } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace
        .connect(addr2)
        .offer(listId, 0, { value: ethers.parseEther("50") });
    });

    it("Should offer with tokens", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_ } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr2.address, 500);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);

      await marketplace.connect(addr2).offer(listId, 60);
    });

    it("Should revert if already sold", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, owner_);
      await BlockToken.connect(owner_).transfer(addr3.address, 500);
      await BlockToken.connect(addr3).approve(marketplace.getAddress(), 1000);
      await marketplace.connect(addr3).buyNft(listId);

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr2.address, 500);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);
      await expect(
        marketplace.connect(addr2).offer(listId, 60)
      ).to.be.revertedWith("Already sold");
    });

    it("Should revert when invalid offer is given (Native)", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await expect(
        marketplace.connect(addr2).offer(listId, 0, { value: 5 })
      ).to.be.revertedWith("Invalid offer");
    });

    it("Should revert when invalid offer is given (Tokens)", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr2.address, 500);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);
      await expect(
        marketplace.connect(addr2).offer(listId, 5)
      ).to.be.revertedWith("Invalid offer");
    });

    it("Should revert if offering erc20", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr3.address, 500);
      await BlockToken.connect(addr3).approve(marketplace.getAddress(), 1000);
      await expect(
        marketplace.connect(addr3).offer(listId, ethers.parseUnits("50", 18), {
          value: ethers.parseEther("10"), // Satisfy minOffer
        })
      ).to.be.revertedWith("Cannot offer erc20");
    });

    it("Should revert if owner tries to offer", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await expect(
        marketplace.connect(addr1).offer(listId, 0, { value: 50 })
      ).to.be.revertedWith("Owner cannot offer");
    });
  });

  describe("Cancel Offer", () => {
    it("Should Cancel Offer (Native)", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).offer(listId, 0, { value: 40 });
      let offerId = 0;
      await marketplace.connect(addr2).cancelOffer(offerId);
    });

    it("Should revert when offer has already been accepted", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).offer(listId, 0, { value: 40 });
      let offerId = 0;

      await marketplace.connect(addr1).acceptOffer(offerId);
      await expect(
        marketplace.connect(addr2).cancelOffer(offerId)
      ).to.be.revertedWith("Offer already accepted");
    });

    it("Should Cancel Offer (Tokens)", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr2.address, 500);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);

      await marketplace.connect(addr2).offer(listId, 50);
      let offerId = 0;
      await marketplace.connect(addr2).cancelOffer(offerId);
    });

    it("Should revert when invalid offerer offers", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).offer(listId, 0, { value: 40 });
      let offerId = 0;
      await expect(
        marketplace.connect(addr3).cancelOffer(offerId)
      ).to.be.revertedWith("Unauthorized offerrer");
    });

    it("Should get Offer", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, addr1);
      await BlockToken.connect(addr1).transfer(addr2.address, 500);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);

      await marketplace.connect(addr2).offer(listId, 50);
      let offerId = 0;
      await marketplace.connect(addr1).getOffer(offerId);
    });
  });

  describe("Accept Offer", () => {
    it("Should accept offer (Native)", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).offer(listId, 0, { value: 40 });
      let offerId = 0;

      await marketplace.connect(addr1).acceptOffer(offerId);
    });

    it("Should accept offer (Tokens)", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await BlockToken.connect(owner_).mint(1000, owner_);
      await BlockToken.connect(owner_).transfer(addr2.address, 700);
      await BlockToken.connect(addr2).approve(marketplace.getAddress(), 1000);

      await marketplace.connect(addr2).offer(listId, 50);
      let offerId = 0;

      await marketplace.connect(addr1).acceptOffer(offerId);
    });

    it("Should revert if invalid owner accepts offer", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).offer(listId, 0, { value: 40 });
      let offerId = 0;

      await expect(
        marketplace.connect(addr2).acceptOffer(offerId)
      ).to.be.revertedWith("Unauthorized seller");
    });

    it("Should revert if Already Sold", async () => {
      const { marketplace, addr1, addr2, blocknft, BlockToken, owner_, addr3 } =
        await loadFixture(deployBlockMarketPlace);

      let tokenId = 1;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true);

      let listId = 0;
      let ZeroAddress = "0x0000000000000000000000000000000000000000";

      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: ZeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 100,
        sold: false,
        minOffer: 10,
      });

      await marketplace.connect(addr2).offer(listId, 0, { value: 40 });
      let offerId = 0;

      await marketplace.connect(addr3).buyNft(listId, { value: 100 });
      await expect(
        marketplace.connect(addr1).acceptOffer(offerId)
      ).to.be.revertedWith("Already Sold");
    });
  });
});
