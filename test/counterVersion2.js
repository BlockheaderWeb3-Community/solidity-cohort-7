const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");
const { ethers } = require("hardhat");


const deployCounter = async () => {
  
  const CounterContract1 = await ethers.getContractFactory("CounterV2");
  const counterV2 = await CounterContract1.deploy();

  
  const CounterContract2 = await ethers.getContractFactory("CounterV2Caller");
  const targetAddress = await counterV2.getAddress();
 

  
  const counterV2caller = await CounterContract2.deploy(targetAddress);

 

  return { counterV2, counterV2caller }; // Returns the deployed contracts as an object
};

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
        ).to.be.revertedWith("Unauthorized Caller"); // The .connect(attacker) calls the counterV2 contract instance with a different signer and the ".to.be.revertedWith()" expects the same string message passed in your require statement in the solidity contract function you wrote
      });
    });

    describe("Unauthorized Caller of the resetCount() function", () => {
      it("Should revert if the caller is unauthorized", async () => {
        const { counterV2 } = await loadFixture(deployCounter);
        const [, attacker] = await ethers.getSigners();

        await counterV2.setCount(20);
        await expect(
          counterV2.connect(attacker).resetCount()
        ).to.be.revertedWith("Unauthorized Caller");
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
// This test suite is for the CounterV2 contract and its interaction with the CounterV2Caller contract
// It includes tests for deployment, transactions, reverts, and indirect interactions
// The tests cover setting the count, decrementing the count, resetting the count, and ensuring unauthorized calls are handled correctly
// The tests also ensure that the contracts interact as expected, especially through the CounterV2Caller contract
// The test suite uses Hardhat's loadFixture to deploy the contracts and run tests in a clean environment