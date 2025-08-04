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
  const [owner_, addr1, addr2,addr3,addr4] = await ethers.getSigners();
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
  return { marketplace, blocknft, BlockToken, owner_, addr1, addr2,addr3,addr4}; // return the deployed instance of our BlockMarketPlace contract
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
      await blocknft.connect(addr1).mint(addr1); // mint nft
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft
        .connect(addr1)
        .setApprovalForAll(marketplace.getAddress(), true); // approve
      let tx1 = marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 0,
        sold: false,
        minOffer: 10,
      }); //  list 

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
    it("Should return correct lastUpdatedid after multiple listings", async () => {
      //Verify lastUpdatedid increments correctly
      const { marketplace, blocknft, addr1, BlockToken } = await loadFixture(deployBlockMarketPlace);
      let tokenId1 = 1;
      let tokenId2 = 2;
      await blocknft.connect(addr1).mint(addr1);
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId1,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 50,
        sold: false,
        minOffer: 10,
      });
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId2,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 50,
        sold: false,
        minOffer: 10,
      });
      expect(await marketplace.lastUpdatedid()).to.eq(2);
    });
  });

 describe("Buy NFT", async () => {
   it("should revert if the NFT already sold or should buy succeefully", async ()=>{
    const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(1000,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(1000);
    await BlockToken.connect(addr2).approve(marketplace,100);
    await marketplace.connect(addr2).buyNft(listId);
    expect(await blocknft.ownerOf(tokenId)).to.eq(addr2);
    const listing = await marketplace.getListing(listId);
    expect(listing.sold).to.equal(true);



  })
  it("should verify if funds are split currectly between seller and market owner", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(50,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(50);
    await BlockToken.connect(addr2).approve(marketplace,50);
    await marketplace.connect(addr2).buyNft(listId);
    expect(await blocknft.ownerOf(tokenId)).to.eq(addr2);
    const listing = await marketplace.getListing(listId);
    expect(listing.sold).to.equal(true);
    console.log(await BlockToken.balanceOf(addr1));
    console.log(await BlockToken.balanceOf(addr2));
    expect(await BlockToken.balanceOf(addr1)).to.eq(48);
    expect(await BlockToken.balanceOf(owner_)).to.eq(1);
  })

  it("should transfer NFT to buyer", async ()=>{
    const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(50,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(50);
    await BlockToken.connect(addr2).approve(marketplace,50);
    await marketplace.connect(addr2).buyNft(listId);
    expect(await blocknft.ownerOf(tokenId)).to.eq(addr2);
  })








  it("should allow listing with native currency and zero address payment token", async () => {
    // Verify that a native currency listing with zero address payment token succeeds
    const { marketplace, blocknft, addr1 } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId: tokenId,
      paymentToken: zeroAddress,
      NftToken: blocknft.getAddress(),
      isNative: true,
      price:10,
      sold: false,
      minOffer: 2,
    });
    const listing = await marketplace.getListing(0);
    expect(listing.isNative).to.eq(true);
    expect(listing.paymentToken).to.eq(zeroAddress);
    expect(listing.owner).to.eq(addr1.address);
    expect(await blocknft.ownerOf(tokenId)).to.eq(await marketplace.getAddress());
  });

  it("should revert if native currency listing has non-zero payment token", async () => {
    //  Test that isNative=true with non-zero paymentToken reverts
    const { marketplace, blocknft, BlockToken, addr1 } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    await blocknft.connect(addr1).mint(addr1);
    let token = await ethers.getContractAt("IERC20", BlockToken);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
    await expect(
      marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: ethers.parseEther("1"),
        sold: false,
        minOffer: ethers.parseEther("0.1"),
      })
    ).to.be.revertedWith("ERC20 Payment is not supported");
  
  });

 
  



  it("should revert if incorrect ETH amount sent for native currency", async () => {
    // Purpose: Test that buying with incorrect ETH amount for isNative=true reverts
    const { marketplace, blocknft, addr1, addr2 } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
    await blocknft.connect(addr1).mint(addr1);
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId: tokenId,
      paymentToken: zeroAddress,
      NftToken: blocknft.getAddress(),
      isNative: true,
      price: ethers.parseEther("1"),
      sold: false,
      minOffer: ethers.parseEther("0.1"),
    });
    await expect(
      marketplace.connect(addr2).buyNft(listId, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Incorrect price");
  });

  it("should allow buying with ERC20 for non-native currency", async () => {
    // Purpose: Verify that buying with ERC20 for isNative=false succeeds
    const { marketplace, blocknft, BlockToken, owner_, addr1, addr2 } = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
    await blocknft.connect(addr1).mint(addr1);
    let token = await ethers.getContractAt("IERC20", BlockToken);
    await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
    const price = 50;
    await marketplace.connect(addr1).listNft({
      owner: addr1,
      tokenId: tokenId,
      paymentToken: token,
      NftToken: blocknft.getAddress(),
      isNative: false,
      price: 50,
      sold: false,
      minOffer: 10,
    });
    await BlockToken.connect(owner_).mint(100, addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(100);
    await BlockToken.connect(addr2).approve(marketplace, price);
    await marketplace.connect(addr2).buyNft(listId);
    expect(await blocknft.ownerOf(tokenId)).to.eq(addr2.address);
    expect(await BlockToken.balanceOf(addr1)).to.eq(48);
    expect(await BlockToken.balanceOf(owner_)).to.eq(1);
    const listing = await marketplace.getListing(listId);
    expect(listing.sold).to.equal(true);
  });










describe("make offer", async()=> {

  it("should accept a valid offer", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 30,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(50,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(50);
    await BlockToken.connect(addr2).approve(marketplace,50);
    await expect(marketplace.connect(addr2).offer(listId,5)).to.be.revertedWith("Invalid offer");

  })

  it("should revert if NFT already sold", async ()=>{
    const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(50,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(50);
    await BlockToken.connect(addr2).approve(marketplace,50);
    await marketplace.connect(addr2).buyNft(listId);
    expect(await blocknft.ownerOf(tokenId)).to.eq(addr2);
    const listing = await marketplace.getListing(listId);
    expect(listing.sold).to.equal(true);

    await BlockToken.connect(owner_).mint(50,addr3);
    expect( await BlockToken.balanceOf(addr3)).to.eq(50);
    await BlockToken.connect(addr3).approve(marketplace,50);
    await expect(marketplace.connect(addr3).offer(listId,30)).to.be.revertedWith("Already sold");

  })
  it("should revert if owner tries to make an offer", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(50,addr1);
    expect(await BlockToken.balanceOf(addr1)).to.eq(50);
    await BlockToken.connect(addr1).approve(marketplace,50);
    await expect(marketplace.connect(addr1).offer(listId,30)).to.be.revertedWith("Owner cannot offer");


  })
  it("should lock funds in contract", async ()=>{
    const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    await BlockToken.connect(owner_).mint(50,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(50);
    await BlockToken.connect(addr2).approve(marketplace,50);
    await marketplace.connect(addr2).offer(listId,20);
    expect(await BlockToken.balanceOf(marketplace)).to.eq(20);
  })

    it("should revert if ETH offer is below minimum offer", async () => {
      // Purpose: Verify that an offer with insufficient ETH reverts with "Invalid offer"
      const { marketplace, blocknft, addr1, addr2 } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
      await blocknft.connect(addr1).mint(addr1);
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
      // List NFT with native currency
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: zeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: 10,
        sold: false,
        minOffer: 3,
      });
      // Offer with insufficient ETH
      await expect(
        marketplace.connect(addr2).offer(listId, 0)
      ).to.be.revertedWith("Invalid offer");
    });
    
    it("should revert if non-zero offerAmount is provided for native currency", async () => {
      // Purpose: Verify that a non-zero offerAmount for a native currency listing reverts
      const { marketplace, blocknft, addr1, addr2 } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
      await blocknft.connect(addr1).mint(addr1);
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
      // List NFT with native currency
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: zeroAddress,
        NftToken: blocknft.getAddress(),
        isNative: true,
        price: ethers.parseEther("1"),
        sold: false,
        minOffer: ethers.parseEther("0.1"),
      });
      // Offer with non-zero offerAmount
      await expect(
        marketplace.connect(addr2).offer(listId, ethers.parseEther("0.1"), { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Cannot offer erc20");
    });


  describe("Accept offer", async()=>{
    it("should allow seller to accept valid offer", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
    let tokenId = 1;
    let listId = 0;
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
      price: 50,
      sold: false,
      minOffer: 10,
    })
    let offerId = await marketplace.getOffer(0);
    await BlockToken.connect(owner_).mint(50,addr2);
    expect(await BlockToken.balanceOf(addr2)).to.eq(50);
    await BlockToken.connect(addr2).approve(marketplace,50);
    await marketplace.connect(addr2).offer(listId,20);
    await marketplace.connect(addr1).acceptOffer(offerId.offerrer);


    })

    it("should revert if not seller", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
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
        price: 50,
        sold: false,
        minOffer: 10,
      })
      let offerId = await marketplace.getOffer(0);
      console.log(offerId);
      await BlockToken.connect(owner_).mint(50,addr2);
      expect(await BlockToken.balanceOf(addr2)).to.eq(50);
      await BlockToken.connect(addr2).approve(marketplace,50);
      await marketplace.connect(addr2).offer(listId,20);
     await expect(marketplace.connect(addr3).acceptOffer(offerId.offerrer)).to.be.revertedWith("Unauthorized seller");
  
    })


    it("should transfer NFT to offerer", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
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
        price: 50,
        sold: false,
        minOffer: 10,
      })
      let offerId = await marketplace.getOffer(0);
    
      await BlockToken.connect(owner_).mint(50,addr2);
      expect(await BlockToken.balanceOf(addr2)).to.eq(50);
      await BlockToken.connect(addr2).approve(marketplace,50);
      await marketplace.connect(addr2).offer(listId,20);
      await marketplace.connect(addr1).acceptOffer(offerId.offerrer);
      expect(await blocknft.ownerOf(tokenId)).is.eq(addr2);
    })

    it("should distribute funds properly", async ()=>{
      const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
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
        price: 50,
        sold: false,
        minOffer: 10,
      })
      let offerId = await marketplace.getOffer(0);
    
      await BlockToken.connect(owner_).mint(50,addr2);
      expect(await BlockToken.balanceOf(addr2)).to.eq(50);
      await BlockToken.connect(addr2).approve(marketplace,50);
      await marketplace.connect(addr2).offer(listId,19);
      await marketplace.connect(addr1).acceptOffer(offerId.offerrer);
      expect(await blocknft.ownerOf(tokenId)).is.eq(addr2);
      expect(await BlockToken.balanceOf(addr1)).to.eq(18);
      expect( await BlockToken.balanceOf(marketplace)).to.eq(1);

    })
  });

    describe("cancel offer", async()=>{

      it("should allow offerer to cancel before it's accepted", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        let offerId = await marketplace.getOffer(0);
      
        await BlockToken.connect(owner_).mint(50,addr2);
        expect(await BlockToken.balanceOf(addr2)).to.eq(50);
        await BlockToken.connect(addr2).approve(marketplace,50);
        await marketplace.connect(addr2).offer(listId,20);
        await marketplace.connect(addr2).cancelOffer(offerId.offerrer);
       expect(await blocknft.ownerOf(tokenId)).to.eq(await marketplace.getAddress());

      })

      it("should revert if not offerer", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        let offerId = await marketplace.getOffer(0);
      
        await BlockToken.connect(owner_).mint(50,addr2);
        expect(await BlockToken.balanceOf(addr2)).to.eq(50);
        await BlockToken.connect(addr2).approve(marketplace,50);
        await marketplace.connect(addr2).offer(listId,20);
        await expect(marketplace.connect(addr3).cancelOffer(offerId.offerrer)).to.be.revertedWith("Unauthorized offerrer");
      })

      it("should return funds back", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        let offerId = await marketplace.getOffer(0);
      
        await BlockToken.connect(owner_).mint(50,addr2);
        expect(await BlockToken.balanceOf(addr2)).to.eq(50);
        await BlockToken.connect(addr2).approve(marketplace,50);
        await marketplace.connect(addr2).offer(listId,20);
        await marketplace.connect(addr2).cancelOffer(offerId.offerrer);
        expect(await BlockToken.balanceOf(addr2)).be.eq(50);
      })
      it("should delete offer from storage", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        let offerId = await marketplace.getOffer(0);
      
        await BlockToken.connect(owner_).mint(50,addr2);
        expect(await BlockToken.balanceOf(addr2)).to.eq(50);
        await BlockToken.connect(addr2).approve(marketplace,50);
        await marketplace.connect(addr2).offer(listId,20);
        await marketplace.connect(addr2).cancelOffer(offerId.offerrer);

        const deleteOffer = await marketplace.connect(addr2).getOffer(0);
        expect(deleteOffer.offerrer).to.equal(ethers.ZeroAddress);
      })

    })

    describe("cancel listing", async ()=>{

      it("should cancel listing properly", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        const cancelListing = await marketplace.getListing(listId);
        await marketplace.connect(addr1).cancelListing(listId);
      })
  
      })

      it("should revert if not owner", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        await expect(marketplace.connect(addr2).cancelListing(listId)).to.be.revertedWith("Unauthorized user");
      })

      it("should revert if already sold", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        await BlockToken.connect(owner_).mint(1000,addr2);
        expect(await BlockToken.balanceOf(addr2)).to.eq(1000);
        await BlockToken.connect(addr2).approve(marketplace,100);
        await marketplace.connect(addr2).buyNft(listId);
        expect(await blocknft.ownerOf(tokenId)).to.eq(addr2);
        const listing = await marketplace.getListing(listId);
        expect(listing.sold).to.equal(true);
        await expect(marketplace.connect(addr1).cancelListing(listId)).to.be.revertedWith("Already sold");
      })

      it("should return NFT back to owner", async ()=>{
        const {marketplace,blocknft,BlockToken, owner_, addr1, addr2, addr3} = await loadFixture(deployBlockMarketPlace);
        let tokenId = 1;
        let listId = 0;
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
          price: 50,
          sold: false,
          minOffer: 10,
        })
        const cancelListing = await marketplace.getListing(listId);
      await marketplace.connect(addr1).cancelListing(cancelListing.tokenId);
      expect(await blocknft.ownerOf(tokenId)).to.eq(addr1.address);
  
      })

    it("should delete listing from storage and return NFT to owner", async () => {
      // Purpose: Verify that cancelListing deletes the listing from idToListing and transfers NFT back to owner
      const { marketplace, blocknft, BlockToken, owner_, addr1 } = await loadFixture(deployBlockMarketPlace);
      let tokenId = 1;
      let listId = 0;
      await blocknft.connect(addr1).mint(addr1);
      let token = await ethers.getContractAt("IERC20", BlockToken);
      await blocknft.connect(addr1).setApprovalForAll(marketplace.getAddress(), true);
      await marketplace.connect(addr1).listNft({
        owner: addr1,
        tokenId: tokenId,
        paymentToken: token,
        NftToken: blocknft.getAddress(),
        isNative: false,
        price: 50,
        sold: false,
        minOffer: 10,
      });
      // Verify listing exists before cancellation
      const listingBefore = await marketplace.getListing(listId);
      expect(listingBefore.owner).to.eq(addr1.address);
      expect(listingBefore.tokenId).to.eq(tokenId);
      // Cancel listing
      await marketplace.connect(addr1).cancelListing(listId);
      // Verify listing is deleted (all fields should be default/zero)
      const listingAfter = await marketplace.getListing(listId);
      expect(listingAfter.owner).to.eq(ethers.ZeroAddress);
      expect(listingAfter.tokenId).to.eq(0);
      expect(listingAfter.price).to.eq(0);
      expect(listingAfter.minOffer).to.eq(0);
      expect(listingAfter.sold).to.eq(false);
      expect(listingAfter.isNative).to.eq(false);
      expect(listingAfter.paymentToken).to.eq(ethers.ZeroAddress);
      expect(listingAfter.NftToken).to.eq(ethers.ZeroAddress);
      // Verify NFT is transferred back to owner
      expect(await blocknft.ownerOf(tokenId)).to.eq(addr1.address);
    });
  });

});
});
