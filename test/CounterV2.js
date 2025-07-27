const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { extendProvider } = require("hardhat/config");

//util function
const deployCounterV2 = async () => {
     // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CounterV2 = await ethers.getContractFactory("CounterV2");
    const counterV2 = await CounterV2.deploy();

    return {owner, otherAccount, counterV2};
}

// Counter V2 Test Suite
describe("Counter V2 Test Suite", () => {
    describe("Deployment", () =>{
        it("Should return default value of 0 upon deployment and assign msg.sender to owner", async () =>{
            const { owner, counterV2 } = await loadFixture(deployCounterV2);
            expect(await counterV2.getCount()).to.eq(0);
            expect(await counterV2.getOwner()).to.eq(owner);
        })
    })

    describe("Transaction", () =>{
        describe("setCount", () => {
            it("Should revert with the right error if _count is less than or equal to zero", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                expect(counterV2.setCount(-2)).to.be.revertedWith("Count must be greater than 0");


            })

            it("Should revert with the right error if called from another account", async () =>{
                const { otherAccount, counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await expect(counterV2.connect(otherAccount).setCount(34)).to.be.revertedWith("You are unauthorised");
            })

            it("Should set appropriate count values", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await counterV2.setCount(10);

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(10);

            })

            it("Should set appropriate count values in mutiple instance", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await counterV2.setCount(10);

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(10);

                await counterV2.setCount(5);

                let count3 = await counterV2.getCount();
                expect(count3).to.eq(5);

                await counterV2.setCount(15);

                let count4 = await counterV2.getCount();
                expect(count4).to.eq(15);
            })    
        
        })

        describe("IncreaseCountByOne", () => {

            it("Should revert with the right error if called from another account", async () =>{
                const { otherAccount, counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await expect(counterV2.connect(otherAccount).increaseCountByOne()).to.be.revertedWith("You are unauthorised");
            })


            it("Should increase count by one", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await counterV2.increaseCountByOne();

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(1);

            })

            it("Should first set count then increase count by one in multiple instances", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                await counterV2.setCount(100);

                let count1 = await counterV2.getCount();
                expect(count1).to.eq(100);

                await counterV2.increaseCountByOne();

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(101);

                await counterV2.increaseCountByOne();

                let count3 = await counterV2.getCount();
                expect(count3).to.eq(102);

                await counterV2.increaseCountByOne();

                let count4 = await counterV2.getCount();
                expect(count4).to.eq(103);
            })
        })

        describe("DecreaseCountByOne", () => {

            it("Should revert with the right error if called from another account", async () =>{
                const { otherAccount, counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await expect(counterV2.connect(otherAccount).decreaseCountByOne()).to.be.revertedWith("You are unauthorised");
            })


            it("Should decrease count by one", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                await counterV2.setCount(100)

                let count1 = await counterV2.getCount();
                expect(count1).to.eq(100);

                await counterV2.decreaseCountByOne();

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(99);

            })

            it("Should first set count then decrease count by one in multiple instances", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                await counterV2.setCount(100);

                let count1 = await counterV2.getCount();
                expect(count1).to.eq(100);

                await counterV2.decreaseCountByOne();

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(99);

                await counterV2.decreaseCountByOne();

                let count3 = await counterV2.getCount();
                expect(count3).to.eq(98);

                await counterV2.decreaseCountByOne();

                let count4 = await counterV2.getCount();
                expect(count4).to.eq(97);
            })
        })

        describe("resetCount", () => {

            it("Should revert with the right error if called when value is already at default", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await expect(counterV2.resetCount()).to.be.revertedWith("Cannot reset value , It's already at default");
            })

            it("Should revert with the right error if called from another account", async () =>{
                const { otherAccount, counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await counterV2.setCount(10);

                await counterV2.increaseCountByOne();
                await counterV2.increaseCountByOne()

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(12);

                await counterV2.decreaseCountByOne();
                let count3 = await counterV2.getCount();
                expect(count3).to.eq(11);

                await expect(counterV2.connect(otherAccount).resetCount()).to.be.revertedWith("You are unauthorised");
            })


            it("Should reset count value to 0(default)", async () =>{
                const { counterV2 } = await loadFixture(deployCounterV2); //extract deployed contract instance
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);

                await counterV2.setCount(10);

                await counterV2.increaseCountByOne();
                await counterV2.increaseCountByOne()

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(12);

                await counterV2.decreaseCountByOne();
                let count3 = await counterV2.getCount();
                expect(count3).to.eq(11);

                await counterV2.resetCount(); //function to rest count to 0
                let count4 = await counterV2.getCount();
                expect(count4).to.eq(0);


            })   
        
        })
    })

})
