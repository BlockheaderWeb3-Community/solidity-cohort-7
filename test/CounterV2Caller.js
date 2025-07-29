const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// DEPLOY
const deployCounter = async () => {
  // const [owner, otherAccount] = await ethers.getSigners();

  const CounterV2Contract = await ethers.getContractFactory("CounterV2");
  const counterV2 = await CounterV2Contract.deploy(); //if no constructor no need to put anything in the depl0y place
  const counterV2address = await counterV2.getAddress();

  const CounterV2CallerContract = await ethers.getContractFactory(
    "CounterV2Caller"
  ); //targeting counter.sol
  const counterV2Caller = await CounterV2CallerContract.deploy(
    counterV2address
  );

  return { counterV2, counterV2Caller }; //return the deployed instance of our counter contract
};

describe("CounterV2Caller Test Suite", () => {
  describe("Deployment", () => {
    it("Should return default values upon deployment", async () => {
      const { counterV2 } = await loadFixture(deployCounter);
      expect(await counterV2.getCount()).to.eq(0); //assert count equal to 0 upon deployment
      // console.log("counter here: ___", counter);
    });
  });
  describe("Transactions", async () => {
    it("Should successfully decrement", async () => {
      const { counterV2, counterV2Caller } = await loadFixture(deployCounter);
      await counterV2.setCount(10);
      await counterV2Caller.decreaseCount();

      const countAfterChnage = await counterV2.getCount();
      expect(countAfterChnage).to.eq(9);
    });
    // it("Should decrease count ", async () => {
    //   const { counter, counterV2 } = await loadFixture(deployCounter);
    //   await counter.setCount(9);
    //   await counterV2.decreaseCount();
    //   const counter2 = await counter.getCount();
    //   expect(counter2).to.eq(8);
    // });
  });
});
