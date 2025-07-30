// const {
//   loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { expect } = require("chai");

// describe("CounterV2 Contract Test Suite", function () {
//   async function deployCounterV2Fixture() {
//     const [owner, otherAccount] = await ethers.getSigners();
//     const CounterV2 = await ethers.getContractFactory("CounterV2");
//     const counter = await CounterV2.deploy();
//     return { counter, owner, otherAccount };
//   }

//   describe("Deployment", function () {
//     it("Should set initial count to 0", async function () {
//       const { counter, owner } = await loadFixture(deployCounterV2Fixture);
//       expect(await counter.getCount()).to.equal(0);
//       expect(await counter.getOwner()).to.equal(owner.address);
//     });
//   });

//   describe("setCount()", function () {
//     it("Should allow owner to set count > 0", async function () {
//       const { counter, owner } = await loadFixture(deployCounterV2Fixture);
//       await counter.setCount(5);
//       expect(await counter.getCount()).to.equal(5);
//     });

//     it("Should revert if count is 0", async function () {
//       const { counter } = await loadFixture(deployCounterV2Fixture);
//       await expect(counter.setCount(0)).to.be.revertedWith(
//         "Count must be greater than 0"
//       );
//     });

//     it("Should revert if called by non-owner", async function () {
//       const { counter, otherAccount } = await loadFixture(
//         deployCounterV2Fixture
//       );
//       await expect(
//         counter.connect(otherAccount).setCount(10)
//       ).to.be.revertedWith("You are unauthorised");
//     });
//   });

//   describe("increaseCountByOne()", function () {
//     it("Should increase count by 1 if called by owner", async function () {
//       const { counter } = await loadFixture(deployCounterV2Fixture);
//       await counter.setCount(2);
//       await counter.increaseCountByOne();
//       expect(await counter.getCount()).to.equal(3);
//     });

//     it("Should revert if called by non-owner", async function () {
//       const { counter, otherAccount } = await loadFixture(
//         deployCounterV2Fixture
//       );
//       await counter.setCount(1);
//       await expect(
//         counter.connect(otherAccount).increaseCountByOne()
//       ).to.be.revertedWith("You are unauthorised");
//     });
//   });

//   describe("resetCount()", function () {
//     it("Should reset count to 0 if count > 0", async function () {
//       const { counter } = await loadFixture(deployCounterV2Fixture);
//       await counter.setCount(10);
//       await counter.resetCount();
//       expect(await counter.getCount()).to.equal(0);
//     });

//     it("Should revert if count is already 0", async function () {
//       const { counter } = await loadFixture(deployCounterV2Fixture);
//       await expect(counter.resetCount()).to.be.revertedWith(
//         "Cannot reset value , It's already at default"
//       );
//     });

//     it("Should revert if called by non-owner", async function () {
//       const { counter, otherAccount } = await loadFixture(
//         deployCounterV2Fixture
//       );
//       await counter.setCount(5);
//       await expect(
//         counter.connect(otherAccount).resetCount()
//       ).to.be.revertedWith("You are Unauthorised");
//     });
//   });

//   describe("decreaseCountByOne()", function () {
//     it("Should decrease count by 1 if called by owner", async function () {
//       const { counter } = await loadFixture(deployCounterV2Fixture);
//       await counter.setCount(10);
//       await counter.decreaseCountByOne();
//       expect(await counter.getCount()).to.equal(9);
//     });

//     it("Should revert if called by non-owner", async function () {
//       const { counter, otherAccount } = await loadFixture(
//         deployCounterV2Fixture
//       );
//       await counter.setCount(10);
//       await expect(
//         counter.connect(otherAccount).decreaseCountByOne()
//       ).to.be.revertedWith("You are unauthorised");
//     });
//   });
// });
