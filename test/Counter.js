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
               
            })
        })

        describe("IncreaseCountByOne", () => {
            it("Should set appropriate increaseCountByOne value",  async () => {
                
            })

            it("Should set appropriate values for multiple increaseCountByOne txns",  async () => {
              
            })
        })
    })
})