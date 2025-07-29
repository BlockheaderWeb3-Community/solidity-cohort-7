const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// util functon 
const deployCounter = async () => {
    // target the Counter contract within our contract folder
    const CounterV2Contract = await ethers.getContractFactory("CounterV2"); // target CounterV2.sol
    const [owner, otherAccount] = await ethers.getSigners();
    const counter = await CounterV2Contract.deploy(); // deploy the Counter contract
    return {counter, owner, otherAccount}; 
}

  
describe("CounterV2 Test Suite", () => {
    describe("Deployment", () => {
        it("Should return default values upon deployment",  async () => {
            const {counter}  = await loadFixture(deployCounter);
            let count = await counter.getCount();
            expect(count).to.eq(0); 
        })
    })

    describe("Transactions", () => {
        describe("SetCount", () => {
            it("Should set appropriate count values",  async () => {
                const  {counter, owner}  = await loadFixture(deployCounter); 
                let count1 = await counter.getCount(); 
                expect(count1).to.eq(0);
                await counter.connect(owner).setCount(10) // make owner explicit
    
                let count2 = await counter.getCount(); 
                expect(count2).to.eq(10) 
            })

            it("should revert if invalid owner calls setCount", async () => {
                const {counter, otherAccount} = await loadFixture(deployCounter);
                await expect(counter.connect(otherAccount).setCount(10)).to.be.revertedWith("unauthorized address");
            })

            it("Should set appropriate values for multiple setCount txns",  async () => {
                const  {counter, owner}  = await loadFixture(deployCounter); 
                let count3 = await counter.getCount(); 
                expect(count3).to.eq(0);
                await counter.connect(owner).setCount(20) 
    
                let count4 = await counter.getCount()
                expect(count4).to.eq(20)
                await counter.connect(owner).setCount(30)

                let count5 = await counter.getCount()
                expect(count5).to.eq(30)
                await counter.connect(owner).setCount(40)

                let count6 = await counter.getCount()
                expect(count6).to.eq(40)
            })
        })

        describe("IncreaseCountByOne", () => {
            it("Should set appropriate increaseCountByOne value",  async () => {
                const {counter, owner} = await loadFixture(deployCounter);
                let count = await counter.getCount()
                expect(count).to.eq(0)
                await counter.connect(owner).setCount(40)
                await counter.connect(owner).increaseCountByOne()

                let count2 = await counter.getCount()
                expect(count2).to.eq(41)
            })

            it("Should revert if invalid owner calls increasecountByOne", async () => {
                const {counter, otherAccount} = await loadFixture(deployCounter);
                await expect(counter.connect(otherAccount).increaseCountByOne()).to.be.revertedWith("unauthorized address");
            })

            it("Should set appropriate values for multiple increaseCountByOne txns",  async () => {
                const {counter, owner} = await loadFixture(deployCounter);
                let count = await counter.getCount()
                expect(count).to.eq(0)
                await counter.connect(owner).setCount(40)
                await counter.connect(owner).increaseCountByOne()

                let count2 = await counter.getCount()
                expect(count2).to.eq(41)
                await counter.connect(owner).increaseCountByOne()

                let count3 = await counter.getCount()
                expect(count3).to.eq(42)
                await counter.connect(owner).increaseCountByOne()

                let count4 = await counter.getCount()
                expect(count4).to.eq(43)
            })
        })

        describe("Reset Count", () => {
            it("Should reset appropriate value by owner", async () => {
                const {counter, owner} = await loadFixture(deployCounter);
                await counter.connect(owner).setCount(5);
                let count1 = await counter.getCount();
                expect(count1).to.eq(5);
                await counter.connect(owner).resetCount();
                let count2 = await counter.getCount();
                expect(count2).to.eq(0);
            })

            it("should revert if invalid owner calls resetCount", async () => {
                const {counter, otherAccount} = await loadFixture(deployCounter);
                await expect(counter.connect(otherAccount).resetCount()).to.be.revertedWith("unauthorized address");
            })
        })

        describe("DecreasecountByOne", () => {
            it("Should set appropriate decreaseCountByOne value by owner", async () => {
                const {counter, owner} = await loadFixture(deployCounter);
                await counter.connect(owner).setCount(10);
                let count1 = await counter.getCount();
                expect(count1).to.eq(10);
                await counter.connect(owner).decreaseCountByOne();
                let count2 = await counter.getCount();
                expect(count2).to.eq(9);
            })

            it("Should revert if invalid owner calls decreaseCountByOne", async () => {
                const {counter, otherAccount} = await loadFixture(deployCounter);
                await expect(counter.connect(otherAccount).decreaseCountByOne()).to.be.revertedWith("unauthorized address");
            })

            it("Should set appropriate values for multiple decreaseCountByOne txns",  async () => {
                const {counter, owner} = await loadFixture(deployCounter);
                await counter.connect(owner).setCount(40)
                await counter.connect(owner).decreaseCountByOne()

                let count2 = await counter.getCount()
                expect(count2).to.eq(39)
                await counter.connect(owner).decreaseCountByOne()

                let count3 = await counter.getCount()
                expect(count3).to.eq(38)
                await counter.connect(owner).decreaseCountByOne()

                let count4 = await counter.getCount()
                expect(count4).to.eq(37)
            })
        })
    })
})