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
    });

    describe("setCount", () => {
        it("Should allow owner to set count", async () => {
            const { counter, otherAccount } = await loadFixture(deployContract);
            await expect( counter.connect(otherAccount).setCount(1)).to.be.revertedWith("You are unauthorised");
        });

        it("Should not allow count to be set at 0", async () => {
            const { counter } = await loadFixture(deployContract);
            await expect(counter.setCount(0)).to.be.revertedWith("Count must be greater than 0");
        });
    });  
         
    describe("getCount", () => {
        it("Should allow owner to get count", async () => {
            const [owner] = await ethers.getSigners();
            const { counter } = await loadFixture(deployContract);
            const count = await counter.connect(owner).getCount();
            console.log("Count value:", count, "Type:", typeof count); // Debug
            if (typeof count === "object" && count.toString) {
            expect(count.toString()).to.equal("10"); // Try string comparison for BigNumber
            } else {
            expect(Number(count)).to.equal(10); // Fallback to number
    }
    });
}); 

//     describe("getCount", () => {
//         it("Should allow owner to get count", async () => {
//         const [owner, otherAccount] = await ethers.getSigners();
//         const { counter } = await loadFixture(deployContract);
//         const count = await counter.connect(owner).getCount(); // Assign the result
//         expect(count.toNumber()).to.equal(10); // Compare the resolved value (adjust for BigNumber)
//         });
