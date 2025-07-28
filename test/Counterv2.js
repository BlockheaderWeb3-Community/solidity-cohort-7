// This is the test code for CounterV2 and CounterV2Caller contracts
// The CounterV2 contract allows users to set a count, reset it, and decrement it
// The CounterV2Caller contract interacts with the CounterV2 contract to decrement the count
// The tests cover deployment, transactions, reverts, and indirect interactions
// The tests ensure that the contracts behave as expected and handle unauthorized access correctly
// The code uses Hardhat and Chai for testing and assertions
// The deployCounter function deploys both contracts and returns their instances
// The test suite is structured to cover different functionalities and edge cases
// The tests check for expected values, reverts, and interactions between the two contracts
// The code is written in JavaScript using the Mocha testing framework and Chai assertion library
// The tests are designed to ensure the integrity and functionality of the contracts
// The code is part of a Solidity project that includes smart contracts and tests
// The contracts are written in Solidity and the tests are written in JavaScript
// The test suite is organized into sections for deployment, transactions, reverts, and indirect interactions
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// util functon
const deployCounter = async () => {
  // target the CounterV2 contract within our contract folder
  const CounterContract1 = await ethers.getContractFactory("CounterV2");
  const counterV2 = await CounterContract1.deploy();

  // target the CounterV2Caller contract within our contract folder
  const CounterContract2 = await ethers.getContractFactory("CounterV2Caller");
  const targetAddress = await counterV2.getAddress();
  // console.log(targetAddress);

  // deploy the contract with the target address we got from calling the getContractFactory() method on the ethers.js library passing in the target contract
  const counterV2caller = await CounterContract2.deploy(targetAddress);

  // console.log("This is the counterV2 object:", counterV2);
  // console.log("This is the counterV2Caller object:", counterV2caller);

  return { counterV2, counterV2caller }; // Returns the deployed contracts as an object
};

// Counter Test Suite
describe("CounterV2 Test Suite", () => {
  describe("Deployment", () => {
    describe("CounterV2 Deployment", () => {
      it("Should return default values upon deployment", async () => {
        const { counterV2 } = await loadFixture(deployCounter);
        expect(await counterV2.count()).to.eq(0);
      });
    });
  });

  describe("Transactions", () => {
    describe("SetCount from counterV2", () => {
      it("Should return count value set by user from the counterV2 contract", async () => {
        const { counterV2 } = await loadFixture(deployCounter);
        let count1 = await counterV2.getCount();
        expect(count1).to.eq(0);
        await counterV2.setCount(10);

        let count2 = await counterV2.getCount();
        expect(count2).to.eq(10);
      });
    });

    describe("DecreaseCountByOne", () => {
      it("Should decrease the count by one from the contractV2caller contract", async () => {
        const { counterV2, counterV2caller } = await loadFixture(deployCounter);
        let count1 = await counterV2.getCount();
        expect(count1).to.eq(0);
        await counterV2.setCount(10);

        let count2 = await counterV2.getCount();
        expect(count2).to.eq(10);
        await counterV2caller.callDecrement();

        let count3 = await counterV2.getCount();
        expect(count3).to.eq(9);
        await counterV2caller.callDecrement();

        let count4 = await counterV2.getCount();
        expect(count4).to.eq(8);
      });
    });

    describe("ResetCount", () => {
      it("Should reset the count set by the user", async () => {
        const { counterV2 } = await loadFixture(deployCounter);
        let count1 = await counterV2.getCount();
        expect(count1).to.eq(0);
        await counterV2.setCount(10);

        let count2 = await counterV2.getCount();
        expect(count2).to.eq(10);
        await counterV2.setCount(40);

        let count3 = await counterV2.getCount();
        expect(count3).to.eq(40);
        await counterV2.resetCount();

        let count4 = await counterV2.getCount();
        expect(count4).to.eq(0);
      });
    });
  });

  describe("Reverts", () => {
    describe("Unauthorized Caller of the setCount() function", () => {
      it("Should revert if the caller is unauthorized", async () => {
        const { counterV2 } = await loadFixture(deployCounter);
        // console.log(await ethers.getSigners());
        const [, attacker] = await ethers.getSigners(); // This returns an array of accounts object and we destructure immediately to get the second account in the array as the first account is the default deployer/signer of the message

        await expect(
          counterV2.connect(attacker).setCount(10)
        ).to.be.revertedWith("Unauthorized Caller Identified"); // The .connect(attacker) calls the counterV2 contract instance with a different signer and the ".to.be.revertedWith()" expects the same string message passed in your require statement in the solidity contract function you wrote
      });
    });

    describe("Unauthorized Caller of the resetCount() function", () => {
      it("Should revert if the caller is unauthorized", async () => {
        const { counterV2 } = await loadFixture(deployCounter);
        const [, attacker] = await ethers.getSigners();

        await counterV2.setCount(20);
        await expect(
          counterV2.connect(attacker).resetCount()
        ).to.be.revertedWith("Unauthorized Caller Identified");
      });
    });

    describe("Zero value argument in setCount() function", () => {
      it("Should revert if the user passes in zero as the argument for the setCount() function", async () => {
        const { counterV2 } = await loadFixture(deployCounter);

        await expect(counterV2.setCount(0)).to.be.revertedWith(
          "Cannot pass zero value as argument"
        );
      });
    });
  });

  describe("Indirect Interaction", () => {
    it("Should successfully decrement count in counterV2 via counterV2Caller", async () => {
      const { counterV2, counterV2caller } = await loadFixture(deployCounter);

      await counterV2.setCount(10);

      await counterV2caller.callDecrement();

      const countAfterChange = await counterV2.count();
      expect(countAfterChange).to.eq(9);
    });
  });
});
