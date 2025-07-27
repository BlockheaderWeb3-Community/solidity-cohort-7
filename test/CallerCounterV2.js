const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { extendProvider } = require("hardhat/config");

//util function
const deployCounterV2 = async () => {
    const CounterV2 = await ethers.getContractFactory("CounterV2");
    const counterV2 = await CounterV2.deploy();

    return counterV2;
}

//util function
const deployCallerCounterV2 = async () => {
     // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    // get CounterV2 contract address
    const counterV2 = await deployCounterV2();
    const counterV2addr = counterV2.getAddress();

    const CallerCounterV2 = await ethers.getContractFactory("CallerCounterV2");
    const callerCounterV2 = await CallerCounterV2.deploy(counterV2addr);

    return {owner, callerCounterV2};
}

//Caller Counter V2 Test Suite
describe("Caller Counter V2 Test Suite", () => {
    describe("Deployment", () =>{
        it("Should return default value of 0 upon deployment", async () =>{
            const { callerCounterV2 } = await loadFixture(deployCallerCounterV2);
            expect(await callerCounterV2.getCount()).to.eq(0);
        })
    })

    describe("Transaction", () =>{

        describe("setCount", () => {
            it("Should revert with the right error if _count is less than or equal to zero", async () =>{
                const {callerCounterV2 } = await loadFixture(deployCallerCounterV2); //extract deployed contract instance
                let count1 = await callerCounterV2.getCount();
                expect(count1).to.eq(0);

                expect(callerCounterV2.setCount(-2)).to.be.revertedWith("Count must be greater than 0");


            })

            it("Should revert with the right error if called from another account", async () =>{
                const { callerCounterV2 } = await loadFixture(deployCallerCounterV2); //extract deployed contract instance
                let count1 = await callerCounterV2.getCount();
                expect(count1).to.eq(0);

                await expect(callerCounterV2.setCount(34)).to.be.revertedWith("You are unauthorised");
            })

        })

        describe("incrementCountByOne", () => {

            it("Should revert with the right error if called from another account", async () =>{
                const { callerCounterV2 } = await loadFixture(deployCallerCounterV2); //extract deployed contract instance
                let count1 = await callerCounterV2.getCount();
                expect(count1).to.eq(0);

                await expect(callerCounterV2.incrementCountByOne()).to.be.revertedWith("You are unauthorised");
            })


        })

        describe("DecreaseCountByOne", () => {

            it("Should revert with the right error if called from another account", async () =>{
                const { callerCounterV2 } = await loadFixture(deployCallerCounterV2); //extract deployed contract instance
                let count1 = await callerCounterV2.getCount();
                expect(count1).to.eq(0);

                await expect(callerCounterV2.decreaseCountByOne()).to.be.revertedWith("You are unauthorised");
            })

        })

        describe("resetCount", () => {

            it("Should revert with the right error if called when value is already at default", async () =>{
                const { callerCounterV2 } = await loadFixture(deployCallerCounterV2); //extract deployed contract instance
                let count1 = await callerCounterV2.getCount();
                expect(count1).to.eq(0);

                await expect(callerCounterV2.resetCount()).to.be.revertedWith("Cannot reset value , It's already at default");
            })

            // the check for count value runs first so it revert b4 reaching the check if address calling
            // the function is owner of CounterV2


            // it("Should revert with the right error if called from another account", async () =>{
            //     const { callerCounterV2 } = await loadFixture(deployCallerCounterV2); //extract deployed contract instance
            //     let count1 = await callerCounterV2.getCount();
            //     expect(count1).to.eq(0);

            //     await expect(callerCounterV2.resetCount()).to.be.revertedWith("You are unauthorised");
            // })

        })
    })

})
