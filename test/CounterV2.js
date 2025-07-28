const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

async function deployCounterV2() {
    const [owner, otherUser] = await ethers.getSigners();
    const CounterV2 = await ethers.getContractFactory("CounterV2");
    const counter = await CounterV2.deploy();
    return { counter, owner, otherUser };
}

describe("CounterV2 Test Suite", function () {

    describe("Deployment", () => {
        it("Should set count to 0 and assign the correct owner", async () => {
            const { counter, owner } = await loadFixture(deployCounterV2);
            expect(await counter.getCount()).to.equal(0);
            expect(await counter.getOwner()).to.equal(owner.address);
        });
    });

    describe("setCount", () => {
        it("Should allow owner to set count > 0", async () => {
            const { counter } = await loadFixture(deployCounterV2);
            await counter.setCount(5);
            expect(await counter.getCount()).to.equal(5);
        });

        it("Should fail if non-owner tries to set count", async () => {
            const { counter, otherUser } = await loadFixture(deployCounterV2);
            await expect(counter.connect(otherUser).setCount(5)).to.be.revertedWith("You are unauthorised");
        });

        it("Should fail if count is set to 0", async () => {
            const { counter } = await loadFixture(deployCounterV2);
            await expect(counter.setCount(0)).to.be.revertedWith("Count must be greater than 0");
        });
    });

    describe("increaseCountByOne", () => {
        it("Should allow owner to increase count", async () => {
            const { counter } = await loadFixture(deployCounterV2);
            await counter.setCount(1);
            await counter.increaseCountByOne();
            expect(await counter.getCount()).to.equal(2);
        });

        it("Should reject increase if called by non-owner", async () => {
            const { counter, otherUser } = await loadFixture(deployCounterV2);
            await counter.setCount(2);
            await expect(counter.connect(otherUser).increaseCountByOne()).to.be.revertedWith("You are unauthorised");
        });
    });

    describe("resetCount", () => {
        it("Should reset count to 0 if owner and count > 0", async () => {
            const { counter } = await loadFixture(deployCounterV2);
            await counter.setCount(3);
            await counter.resetCount();
            expect(await counter.getCount()).to.equal(0);
        });

        it("Should revert if count is already 0", async () => {
            const { counter } = await loadFixture(deployCounterV2);
            await expect(counter.resetCount()).to.be.revertedWith("Cannot reset value , It's already at default");
        });

        it("Should reject reset from non-owner", async () => {
            const { counter, otherUser } = await loadFixture(deployCounterV2);
            await counter.setCount(2);
            await expect(counter.connect(otherUser).resetCount()).to.be.revertedWith("You are Unauthorised");
        });
    });

    describe("decreaseCountByOne", () => {
        it("Should decrease count by one if owner", async () => {
            const { counter } = await loadFixture(deployCounterV2);
            await counter.setCount(2);
            await counter.decreaseCountByOne();
            expect(await counter.getCount()).to.equal(1);
        });

        it("Should fail if non-owner tries to decrease count", async () => {
            const { counter, otherUser } = await loadFixture(deployCounterV2);
            await counter.setCount(2);
            await expect(counter.connect(otherUser).decreaseCountByOne()).to.be.revertedWith("You are unauthorised");
        });
    });
});

