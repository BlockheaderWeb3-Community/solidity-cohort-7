const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const deployContract = async () => {
    const [owner, otherAccount] = await ethers.getSigners();
    const CounterV2 = await ethers.getContractFactory("CounterV2");
    const counter = await CounterV2.deploy();
    const getAddress = await counter.getAddress();
    const callerCounter = await ethers.getContractFactory("callerCounterV2");
    const caller = await callerCounter.deploy(getAddress);
    return { counter, owner, otherAccount, caller };
}

describe("CounterV2 Test Suite", () => {
    describe("Deployment", () => {
        it("Should initialize count to 0", async () => {
            const { counter } = await loadFixture(deployContract);
            expect(await counter.getCount()).to.equal(0);
        });
        it("Should set the correct owner", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            expect(await counter.getOwner()).to.equal(owner.address);
        });
    });

    describe("setCount", () => {
        it("Should allow owner to set count", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await counter.connect(owner).setCount(5);
            expect(await counter.getCount()).to.equal(5);
        });

        it("Should not allow non-owner to set count", async () => {
            const { counter, otherAccount } = await loadFixture(deployContract);
            await expect(counter.connect(otherAccount).setCount(1)).to.be.revertedWith("You are unauthorised");
        });

        it("Should not allow count to be set at 0", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await expect(counter.connect(owner).setCount(0)).to.be.revertedWith("Count must be greater than 0");
        });
    });

    describe("increaseCountByOne", () => {
        it("Should allow owner to increase count by one", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await counter.connect(owner).setCount(2);
            await counter.connect(owner).increaseCountByOne();
            expect(await counter.getCount()).to.equal(3);
        });

        it("Should not allow non-owner to increase count", async () => {
            const { counter, otherAccount } = await loadFixture(deployContract);
            await expect(counter.connect(otherAccount).increaseCountByOne()).to.be.revertedWith("You are unauthorised");
        });
    });

    describe("decreaseCountByOne", () => {
        it("Should allow owner to decrease count by one", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await counter.connect(owner).setCount(5);
            await counter.connect(owner).decreaseCountByOne();
            expect(await counter.getCount()).to.equal(4);
        });

        it("Should not allow non-owner to decrease count", async () => {
            const { counter, otherAccount } = await loadFixture(deployContract);
            await expect(counter.connect(otherAccount).decreaseCountByOne()).to.be.revertedWith("You are unauthorised");
        });

        it("Should allow decrease via callerCounterV2", async () => {
        const { counter, owner, caller } = await loadFixture(deployContract);
        await counter.connect(owner).setCount(3);
  
        });
    });

    describe("resetCount", () => {
        it("Should allow owner to reset count to 0", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await counter.connect(owner).setCount(7);
            await counter.connect(owner).resetCount();
            expect(await counter.getCount()).to.equal(0);
        });

        it("Should not allow reset if count is already 0", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await expect(counter.connect(owner).resetCount()).to.be.revertedWith("Cannot reset value , It's already at default");
        });

        it("Should not allow non-owner to reset count", async () => {
            const { counter, otherAccount, owner } = await loadFixture(deployContract);
            await counter.connect(owner).setCount(2);
            await expect(counter.connect(otherAccount).resetCount()).to.be.revertedWith("You are Unauthorised");
        });
    });

    describe("getCount", () => {
        it("Should return the correct count", async () => {
            const { counter, owner } = await loadFixture(deployContract);
            await counter.connect(owner).setCount(10);
            expect(await counter.getCount()).to.equal(10);
        });
    });
});