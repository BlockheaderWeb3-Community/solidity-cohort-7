const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const deployCounter = async () => {
    const [owner, otherUser] = await ethers.getSigners();
    const CounterContract = await ethers.getContractFactory("Counter");
    const counter = await CounterContract.deploy();
    return { counter, owner, otherUser };
}

describe("Counter Test Suite", () => {

    describe("Deployment", () => {
        it("Should return default values upon deployment", async () => {
            const { counter } = await loadFixture(deployCounter);
            expect(await counter.count()).to.eq(0);
        });
    });

    describe("Transactions", () => {
        describe("SetCount", () => {
            it("Should allow owner to set count", async () => {
                const { counter, owner } = await loadFixture(deployCounter);
                await counter.setCount(5);
                expect(await counter.getCount()).to.eq(5);
            });

            it("Should reject non-owner trying to set count", async () => {
                const { counter, otherUser } = await loadFixture(deployCounter);
                await expect(counter.connect(otherUser).setCount(5)).to.be.revertedWith("Not owner");
            });

            it("Should not allow count > 10", async () => {
                const { counter } = await loadFixture(deployCounter);
                await expect(counter.setCount(11)).to.be.revertedWith("Count must not exceed 10");
            });
        });

        describe("IncreaseCountByOne", () => {
            it("Should allow owner to increase count by 1", async () => {
                const { counter } = await loadFixture(deployCounter);
                await counter.increaseCountByOne();
                expect(await counter.getCount()).to.eq(1);
            });

            it("Should reject non-owner trying to increase count", async () => {
                const { counter, otherUser } = await loadFixture(deployCounter);
                await expect(counter.connect(otherUser).increaseCountByOne()).to.be.revertedWith("Not owner");
            });

            it("Should not allow increasing count beyond 10", async () => {
                const { counter } = await loadFixture(deployCounter);
                await counter.setCount(10);
                await expect(counter.increaseCountByOne()).to.be.revertedWith("Count must not exceed 10");
            });
        });
    });
});

