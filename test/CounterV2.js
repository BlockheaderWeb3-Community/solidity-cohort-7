
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const deployContracts = async () => {
    const [owner, otherAccount] = await ethers.getSigners();

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();

    const Caller = await ethers.getContractFactory("callerICounterV2");
    const CounterAddress = await counter.getAddress();
    const caller = await Caller.deploy(CounterAddress);

    return { counter, caller, owner, otherAccount };
}

describe("Counter Contract Tests", () => {
    it("Should initialize count to 0", async () => {
        const { counter } = await loadFixture(deployContracts);
        expect(await counter.getCount()).to.equal(0);
    });

    it("Should allow owner to set count", async () => {
        const { counter } = await loadFixture(deployContracts);
        await counter.setCount(15);
        expect(await counter.getCount()).to.equal(15);
    });

    it("Should not allow  0 in set count", async () => {
        const { counter } = await loadFixture(deployContracts);
        await expect(counter.setCount(0)).to.be.revertedWith("Can not set count to be zero");
        });


    it("Should revert if non-owner sets count", async () => {
        const { counter, otherAccount } = await loadFixture(deployContracts);
        await expect(counter.connect(otherAccount).setCount(20)).to.be.revertedWith("Unauthorized");
    });

    it("Should increase count by one", async () => {
        const { counter } = await loadFixture(deployContracts);
        await counter.increaseCountByOne();
        expect(await counter.getCount()).to.equal(1);
    });

        it("Should revert if non-owner increase count", async () => {
        const { counter, otherAccount } = await loadFixture(deployContracts);
        await expect(counter.connect(otherAccount).increaseCountByOne()).to.be.revertedWith("Unauthorized");
    });

    it("Should decrease count by one", async () => {
        const { counter } = await loadFixture(deployContracts);
        await counter.setCount(5);
        await counter.decreaseCountByOne();
        expect(await counter.getCount()).to.equal(4);
    });



    it("Should reset count to 0", async () => {
        const { counter } = await loadFixture(deployContracts);
        await counter.setCount(10);
        await counter.resetCount();
        expect(await counter.getCount()).to.equal(0);
    });

    it("Should revert if non-owner resets count", async () => {
        const { counter, otherAccount } = await loadFixture(deployContracts);
        await expect(counter.connect(otherAccount).resetCount()).to.be.revertedWith("Unauthorized");
    });
});

describe("CallerICounterV2 Tests", () => {
    it("Should call decreaseCountByOne via caller contract", async () => {
        const { counter, caller } = await loadFixture(deployContracts);
        await counter.setCount(5);

        await caller.callDecreaseCountByOne();
        expect(await counter.getCount()).to.equal(4);
    });

    it("Should revert caller access from non-owner", async () => {
        const { caller, otherAccount } = await loadFixture(deployContracts);
        await expect(caller.connect(otherAccount).callDecreaseCountByOne()).to.be.revertedWith("Unauthorized");
    });
});
