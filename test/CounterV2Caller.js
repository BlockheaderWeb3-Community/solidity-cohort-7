const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// DEPLOY
const deployCounter = async () => {
  const [owner, otherAccount] = await ethers.getSigners();

  const CounterV2Contract = await ethers.getContractFactory("CounterV2");
  const counterV2 = await CounterV2Contract.deploy(); //if no constructor no need to put anything in the depl0y place
  const counterV2address = await counterV2.getAddress();

  const CounterV2CallerContract = await ethers.getContractFactory("CounterV2Caller");
  const counterV2Caller = await CounterV2CallerContract.deploy(counterV2address);

  return { counterV2, counterV2Caller, owner, otherAccount}; 
};

describe("CounterV2Caller Test Suite", () => {
  describe("Deployment", () => {

    it("Should return default values upon deployment", async () => {
      const { counterV2 } = await loadFixture(deployCounter);
      expect(await counterV2.getCount()).to.eq(0);
    });
  });

  describe("Transactions", async () => {

    it("Should revert if invalid owner calls decreaseCountByOne", async () => {
        const { counterV2Caller, otherAccount} = await loadFixture(deployCounter);
        await expect(counterV2Caller.connect(otherAccount).decreaseCountByOne()).to.be.revertedWith("unauthorized address");
    })
    
  });
});