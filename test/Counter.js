const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// DEPLOY
const deployCounter = async () => {
  // const [owner, otherAccount] = await ethers.getSigners();

  const CounterContract = await ethers.getContractFactory("Counter"); //targeting counter.sol
  const counter = await CounterContract.deploy(); //if no constructor no need to put anything in the depl0y place

  return counter; //return the deployed instance of our counter contract
};

// TEST SUITE
describe("Counter Test Suite", () => {
  describe("Deployment", async () => {
    it("Should return default values upon deployment", async () => {
      const counter = await loadFixture(deployCounter);
      expect(await counter.getCount()).to.eq(0); //assert count equal to 0 upon deployment
      // console.log("counter here: ___", counter);
    });
  });
  describe("Transaction", async () => {
    describe("SetCount", async () => {
      it("Should set appropriate count values", async () => {
        const counter = await loadFixture(deployCounter); //extract deployed counter instance
        let count1 = await counter.getCount(); //check initial value before transaction
        expect(count1).to.eq(0);
        await counter.setCount(10);
        let count2 = await counter.getCount();
        expect(count2).to.eq(10); //check final count equal to 10
        // expect(await counter.getCount()).to.eq(0); //assert count equal to 0 upon deployment
        // console.log("counter here: ___", counter);
      });
      it("Should set appropriate values for multiple setCount txns", async () => {
        const counter = await loadFixture(deployCounter); //extract deployed counter instance
        let count1 = await counter.getCount(); //check initial value before transaction
        expect(count1).to.eq(0);
        await counter.setCount(10);
        let count2 = await counter.getCount();
        expect(count2).to.eq(10); //check final count equal to 10

        let count3 = await counter.getCount();
        expect(count3).to.eq(10);
        await counter.setCount(11);
        let count4 = await counter.getCount();
        expect(count4).to.eq(11); //check final count equal to 10

        let count5 = await counter.getCount();
        expect(count5).to.eq(11);
        await counter.setCount(12);
        let count6 = await counter.getCount();
        expect(count6).to.eq(12); //check final count equal to 10
      });
    });
    describe("Increase count by one", async () => {
      it("Should set appropriate count value to increase by one", async () => {
        const counter = await loadFixture(deployCounter);
        let count1 = await counter.getCount();
        expect(count1).to.eq(0);
        await counter.increaseCountByOne();
        let count2 = await counter.getCount();
        expect(count2).to.eq(1);
      });
      it("Should set appropriate count value to increase by one for multiple increasebyone function", async () => {
        const counter = await loadFixture(deployCounter);
        let count1 = await counter.getCount();
        expect(count1).to.eq(0);
        await counter.increaseCountByOne();
        let count2 = await counter.getCount();
        expect(count2).to.eq(1);

        let count3 = await counter.getCount();
        expect(count3).to.eq(1);
        await counter.increaseCountByOne();
        let count4 = await counter.getCount();
        expect(count4).to.eq(2);

        let count5 = await counter.getCount();
        expect(count5).to.eq(2);
        await counter.increaseCountByOne();
        let count6 = await counter.getCount();
        expect(count6).to.eq(3);
      });
    });
  });
});
