const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");


// util functon 
const deployCounter = async () => {
    // target the Counter contract within our contract folder
    const CounterContract = await ethers.getContractFactory("CounterV2"); // target Counter.sol
    const counterV2 = await CounterContract.deploy(); // deploy the Counter contract
    

    const CounterContract1 = await ethers.getContractFactory("CounterV2Caller");
    const targetAddress = await counterV2.getAddress(); //const targetAddress = await counterV2.getAddress();

    const counterV2caller = await CounterContract1.deploy(targetAddress);


    return {counterV2, counterV2caller} ; // return the deployed instance of our counter contract
}


//Counter Test
describe("Testing Counter Suite Contract.sol", () => {
    describe("Deployment", async() => {
        it("Should return default values upon deployment", async () => {
            const {counterV2} = await loadFixture(deployCounter);
            expect(await counterV2.count()).to.eq(0);
        });
    });

    describe("Transaction", () => {
        describe("SetCount", () =>  {
            it("Should set appropriate count values", async () => {
                const {counterV2} = await loadFixture(deployCounter);
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);
                await counterV2.setCount(10);
            })
            it("Should set appropriate values for multiple setCount txns", async () => {
                const {counterV2} = await loadFixture(deployCounter);
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);
                await counterV2.setCount(1);

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(1);
                await counterV2.setCount(2);
            })
        })

        describe("resetCount", () =>  {
            it("Should reset the value to a default", async () => {
                const {counterV2} = await loadFixture(deployCounter);
                let count1 = await counterV2.getCount();
                expect(count1).to.eq(0);
                await counterV2.setCount(10);

                let count2 = await counterV2.getCount();
                expect(count2).to.eq(10);
                await counterV2.setCount(20);

                let count3 = await counterV2.getCount();
                expect(count3).to.eq(20);
                await counterV2.resetCount();

            })
        })

        describe("IncreaseCountByOne", () => {
            it("Should set appropriate increaseCountByOne value",  async () => {
                const  {counterV2} = await loadFixture(deployCounter); // extract deployed counter instace
                let count1 = await counterV2.getCount(); // check initial count value before txn
                expect(count1).to.eq(0);

                let count2 = await counterV2.getCount(); // check initial count value before txn
                expect(count1).to.eq(0);
                              
            })
        
        })

        describe("DecreaseCount", () => {
            it("Should decrease Count by one value",  async () => {
                const  {counterV2, counterV2caller}  = await loadFixture(deployCounter); // extract deployed counter instace
                let count1 = await counterV2.getCount(); // check initial count value before txn
                expect(count1).to.eq(0);
                await counterV2.setCount(10)

                let count2 = await counterV2.getCount(); // check initial count value before txn
                expect(count2).to.eq(10);
                await counterV2caller.decreementCaller();

                 let count3 = await counterV2.getCount(); // check initial count value before txn
                expect(count3).to.eq(9);
                              
            })
        
        })
    })
})