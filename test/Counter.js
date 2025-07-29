const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

// Utility function to deploy Counter
const deployCounter = async () => {
  const CounterContract = await ethers.getContractFactory("Counter"); // Target Counter.sol
  const counter = await CounterContract.deploy(); // Deploy the Counter contract
  return counter; // Return the deployed instance
};

// Counter Test Suite
describe("Counter Test Suite", () => {
  describe("Deployment", () => {
    it("Should return default values upon deployment", async () => {
      const counter = await loadFixture(deployCounter);
      expect(await counter.count()).to.equal(0); // Assert that count = 0 upon deployment
    });
  });

  describe("Transactions", () => {
    describe("SetCount", () => {
      it("Should set appropriate count values", async () => {
        const counter = await loadFixture(deployCounter);
        expect(await counter.getCount()).to.equal(0);
        await counter.setCount(10);
        expect(await counter.getCount()).to.equal(10);
      });

      it("Should set appropriate values for multiple setCount txns", async () => {
        const counter = await loadFixture(deployCounter);
        expect(await counter.getCount()).to.equal(0);
        await counter.setCount(20);
        expect(await counter.getCount()).to.equal(20);
        await counter.setCount(30);
        expect(await counter.getCount()).to.equal(30);
        await counter.setCount(40);
        expect(await counter.getCount()).to.equal(40);
      });
    });

    describe("IncreaseCountByOne", () => {
      it("Should set appropriate values for multiple increaseCountByOne txns", async () => {
        const counter = await loadFixture(deployCounter);
        await counter.setCount(10);
        expect(await counter.getCount()).to.equal(10);

        // Use a while loop to increment until count reaches 25
        while ((await counter.getCount()) < 25) {
          await counter.increaseCountByOne();
        }
        expect(await counter.getCount()).to.equal(25);

        // Additional increments using a for loop
        for (let i = 0; i < 10; i++) {
          await counter.increaseCountByOne();
        }
        expect(await counter.getCount()).to.equal(35);
      });
    });
  });
});