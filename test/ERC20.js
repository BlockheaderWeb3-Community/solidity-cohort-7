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
        const { BlockToken, addr1 } = await loadFixture(deployBlockToken);
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

    describe("burnFrom", ()=> {
        it("should revert if non-owner call burn from", async ()=>{
            const{BlockToken, owner_, addr1,addr2} = await loadFixture(deployBlockToken);

            await BlockToken.connect(owner_).mint(1000,addr1.address);
            expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

            await BlockToken.connect(addr1).burn(100);
            expect(await BlockToken.balanceOf(addr1)).to.eq(900);

            let maliciousUser = BlockToken.connect(addr2).burnFrom(addr1,900);
            await expect(maliciousUser).to.be.revertedWith("BlockToken:: Unauthorized User");
        })

        it("should revert on zero amount", async ()=>{
            const{BlockToken, owner_,addr1, addr2} = await loadFixture(deployBlockToken);
            await BlockToken.connect(owner_).mint(1000,addr1.address);

            await BlockToken.connect(addr1).burn(100);
            expect(await BlockToken.balanceOf(addr1)).to.eq(900);

            let setZeroValue = BlockToken.connect(owner_).burnFrom(addr1,0);
            await expect(setZeroValue).to.be.revertedWith("BlockToken:: Zero amount not supported");
        })
        it("should burn from user account", async()=>{
            const{BlockToken, owner_,addr1, addr2} = await loadFixture(deployBlockToken);
            await BlockToken.connect(owner_).mint(1000,addr1.address);

            let burnFrom = await BlockToken.connect(owner_).burnFrom(addr1,1000);
            expect(await BlockToken.balanceOf(addr1)).to.eq(0);
        })
        })

        describe("transfer", () =>{
        it("should revert on transfer to Zero address", async()=>{
          const {BlockToken , owner_, addr1,addr2} = await loadFixture(deployBlockToken);
          let zeroAddress = "0x0000000000000000000000000000000000000000";
          //transfer oto zero address
          await expect(BlockToken.connect(owner_).transfer(zeroAddress,800)).to.be.reverted;
          })

        it("should transfer tokens from one user to another", async()=>{
          const{BlockToken, owner_, addr1, addr2} = await loadFixture(deployBlockToken);
          await BlockToken.connect(owner_).mint(1000,owner_);
          expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

          //transfer to another account

          await BlockToken.connect(owner_).transfer(addr1,300);
          expect(await BlockToken.balanceOf(owner_)).to.eq(700);
          expect(await BlockToken.balanceOf(addr1)).to.eq(300);

          await BlockToken.connect(addr1).transfer(owner_,300);
          expect(await BlockToken.balanceOf(addr1)).to.eq(0);    
          expect (await BlockToken.balanceOf(owner_)).to.eq(1000);

       })
        it("should revert if amount to transer is lower than balance", async() => {
       const{BlockToken,owner_,addr1,addr2} = await loadFixture(deployBlockToken);
       await BlockToken.connect(owner_).mint(1000,owner_);
       expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

      await BlockToken.connect(owner_).transfer(addr1,1000);
      expect(await BlockToken.balanceOf(addr1)).to.eq(1000);
      expect(await BlockToken.balanceOf(owner_)).to.eq(0);
      //transfer with lower balance

      await expect(
      BlockToken.connect(owner_).transfer(addr1, 100)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
      expect(await BlockToken.balanceOf(owner_)).to.eq(0);
      expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

      })
        })

      describe("TransferFrom",()=>{
       it("should test, 'approve' updated to 'allowance'", async()=>{
        const{BlockToken,owner_,addr1,addr2} = await loadFixture(deployBlockToken);
        await BlockToken.connect(owner_).mint(1000,owner_);
        expect(await BlockToken.balanceOf(owner_)).to.eq(1000);

        await BlockToken.connect(owner_).approve(addr1,500);
        expect(await BlockToken.allowance(owner_,addr1)).to.eq(500);
       })



       it("should transferFrom owner to addr2 and the caller should be addr1", async()=>{
        const{BlockToken,owner_,addr1, addr2} = await loadFixture(deployBlockToken);
       await BlockToken.connect(owner_).mint(1000,addr1);
       expect (await BlockToken.balanceOf(addr1)).to.eq(1000);

       await BlockToken.connect(addr1).approve(owner_,500);
       expect(await BlockToken.connect(addr1).allowance(addr1,owner_)).to.eq(500);

       await BlockToken.connect(owner_).transferFrom(addr1,addr2,500);
       expect(await BlockToken.balanceOf(addr2)).to.eq(500)
      
       })


       it("should revert if balance 'from' has insufficient allowance", async ()=>{
        const{BlockToken,owner_,addr1,addr2} = await loadFixture(deployBlockToken);
        await BlockToken.connect(owner_).mint(1000,addr1);
       expect (await BlockToken.balanceOf(addr1)).to.eq(1000);

       await BlockToken.connect(addr1).approve(owner_,500);
       expect(await BlockToken.connect(addr1).allowance(addr1,owner_)).to.eq(500);

       await expect(BlockToken.connect(owner_).transferFrom(addr1,addr2,700)).to.be.revertedWithCustomError(BlockToken,"ERC20InsufficientAllowance");
       })
       it("Should revert if 'to' is address zero", async () => {
        const{BlockToken,owner_,addr1,addr2} = await loadFixture(deployBlockToken);
        const zeroAddress = "0x0000000000000000000000000000000000000000";

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(2000);

        await BlockToken.connect(addr1).approve(owner_, 500);
        expect(await BlockToken.connect(addr1).allowance(addr1, owner_)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(owner_).transferFrom(addr1, zeroAddress, 400)
        ).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
      });

      it("Should revert if allowance is incremented and not replaced", async () => {
        const{BlockToken,owner_,addr1,addr2} = await loadFixture(deployBlockToken);

        await BlockToken.connect(owner_).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(owner_, 500);

        await BlockToken.connect(addr1).approve(owner_, 700);
        expect(await BlockToken.connect(addr1).allowance(addr1, owner_)).to.eq(
          700
        );
      });
    });
  });
    