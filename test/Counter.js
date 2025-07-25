const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// util functon 
const deployCounter = async () => {
    // target the Counter contract within our contract folder
    const CounterContract = await ethers.getContractFactory("Counter"); // target Counter.sol
    const counter = await CounterContract.deploy(); // deploy the Counter contract
    return counter ; // return the deployed instance of our counter contract
}

// Counter Test Suite  
describe("Counter Test Suite", () => {
    describe("Deployment", () => {
        it("Should return default values upon deployment",  async () => {
            const  counter  = await loadFixture(deployCounter);
            expect(await counter.count()).to.eq(0); // assert that count = 0 upon deployment
        })
    })

    describe("Transactions", () => {
        describe("SetCount", () => {
            it("Should set appropriate count values",  async () => {
                const  counter  = await loadFixture(deployCounter); // extract deployed counter instace
                let count1 = await counter.getCount(); // check initial count value before txn
                expect(count1).to.eq(0);
                await counter.setCount(10) // assert that count = 0 upon deployment
    
                let count2 = await counter.getCount(); // check initial count value before txn
                expect(count2).to.eq(10) // check final count = 10
            })


            it("Should set appropriate values for multiple setCount txns",  async () => {
               const counter = await loadFixture(deployCounter);
               let count = await counter.getcount();
               expect(count).to.eq(0);

               await counter.setcount(0);
               let count1 = await counter.getcount();
               expect(count1).to.eq(10);

                await counter.setcount(10);
               let count2 = await counter.getcount();
               expect(count1).to.eq(20);

                await counter.setcount(20);
               let count3 = await counter.getcount();
               expect(count1).to.eq(30);


            })
        })

        describe("IncreaseCountByOne", () => {
            it("Should set appropriate increaseCountByOne value",  async () => {
                const counter = await loadFixture(deployCounter);
                let count =await counter.getCount();
                expect(count).to.eq(o);
                
            })

            it("Should set appropriate values for multiple increaseCountByOne txns",  async () => {
                const counter = await loadFixture(deployCounter);
                let count =await counter.getCount();
                expect(count).to.eq(o);

                await counter.increaseCountByOne(0);
                let count1 = await counter.getcount();
                expect(count1).to.eq(1);

                await counter.increaseCountByOne(1);
                let count2 = await counter.getcount();
                expect(count2).to.eq(2);

                await counter.increaseCountByOne(2);
                let count3 = await counter.getcount();
                expect(count3).to.eq(3);
                
            })
              
            })
        })
    })
