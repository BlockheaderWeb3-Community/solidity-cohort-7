const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// DEPLOY
const deployCounter = async () => {
  const [owner, otherAccount] = await ethers.getSigners();

  const CounterV2Contract = await ethers.getContractFactory("CounterV2"); //targeting counter.sol
  const counter = await CounterV2Contract.deploy(); //if no constructor no need to put anything in the depl0y place

  return { counter, owner, otherAccount }; //return the deployed instance of our counter contract
};

describe("CounterV2 Test Suite", () => {
  describe("Deployment", async () => {
    it("Should return default values upon deployment", async () => {
      const { counter } = await loadFixture(deployCounter);
      expect(await counter.getCount()).to.eq(0); //assert count equal to 0 upon deployment
      // console.log("counter here: ___", counter);
    });
  });
  describe("Transactions", async () => {
    it("Should set appropriate count values", async () => {
      const { counter } = await loadFixture(deployCounter);
      const counter1 = await counter.getCount();
      expect(counter1).to.eq(0);
      await counter.setCount(10);
      const counter2 = await counter.getCount();
      expect(counter2).to.eq(10);
    });
    it("Should reset count values to 0", async () => {
      const { counter } = await loadFixture(deployCounter);
      // const counter1 = await counter.getCount();
      // expect(counter1).to.eq(0);
      await counter.resetCount();
      const counter2 = await counter.getCount();
      expect(counter2).to.eq(0);
    });
    it("Should increase count ", async () => {
      const { counter } = await loadFixture(deployCounter);
      const counter1 = await counter.getCount();
      expect(counter1).to.eq(0);
      await counter.increaseCount();
      const counter2 = await counter.getCount();
      expect(counter2).to.eq(1);
    });
    it("Should decrease count ", async () => {
      const { counter } = await loadFixture(deployCounter);
      // const counter1 = await counter.getCount();
      // expect(counter1).to.eq(0);
      await counter.setCount(6);
      await counter.decreaseCount();
      const counter2 = await counter.getCount();
      expect(counter2).to.eq(5);
    });
    describe("Reverts", () => {
      it("should revert if invalid owner calls setCount", async () => {
        const { counter, otherAccount } = await loadFixture(deployCounter);
        await expect(
          counter.connect(otherAccount).setCount(10)
        ).to.be.revertedWith("unauthorized");
      });
      it("should revert if invalid calls resetCount", async () => {
        const { counter, otherAccount } = await loadFixture(deployCounter);
        await expect(
          counter.connect(otherAccount).resetCount()
        ).to.be.revertedWith("unauthorized");
      });
    });
  });
});
