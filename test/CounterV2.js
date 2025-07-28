// const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// // const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { expect } = require("chai");
// const { ethers } = require("hardhat");


// // // util function
// // const deployCounter = async () => {
// //     const CounterContract = await ethers.getContractFactory("CounterV2");
// //     const counterV2 = await CounterContract.deploy();
// //     return counterV2;
// // }

// // // Counter Test Suite
// // describe("Counter Test Suite", () => {
// //     describe("Deployment", () => {
// //         it("Should return default values upon deployment", async () => {
// //             const counterV2 = await loadFixture(deployCounter);
// //             expect(await counterV2.count()).to.eq(0);
// //         })
// //     })


// //     describe("Transactions", () =>  {
// //         describe("SetCount", () => {
// //             it("Should set appropriate count values", async () => {
// //                 const counterV2 = await loadFixture(deployCounter);
// //                 let count1 = await counterV2.getCount();
// //                 expect(count1).to.eq(0);

// //                 await counterV2.setCount(20)

// //                 let count2 = await counterV2.getCount();
// //                 expect(count2).to.eq(20)

// //             })
// //         })

// //         describe("IncreaseCountByOne", () => {
// //             it("Should set appropriate increaseCountByOne value",  async () => {
// //                     const counter = await loadFixture(deployCounter);
// //                     let count2 = await counter.setCount();
// //                     expect(count2).to.eq(20);
        
// //                     await counter.increaseCountByOne();
// //                     let inccount = await counter.getCount();
// //                     expect(inccount).to.eq(1)
// //             })
// //         })

// //         describe("resetCount", () => {
// //             it("Should reset current count value", async () => {
// //                 const counterV2 = await loadFixture(deployCounter);

// //                 await counterV2.setCount(20);
// //                 let count2 = await counterV2.getCount();
// //                 expect(count2).to.eq(20);

// //                 await counterV2.resetCount();
// //                 let retCount = counterV2.getCount;
// //                 expect(retCount).to.eq(0)
// //             })
// //         })
      
// //         describe("CounterCallerV2", () => async function () {
                        

// //             it("should decrease count by one via caller contract", async () => {
// //                  const counterV2 = await loadFixture(deployCounter);
// //                 await counterV2.setCount(20);

// //                 const CallerF = await ethers.getContractFactory("CounterV2Caller");
// //                 const counterCaller = await CallerF.deploy(counterV2.target); // or .address in some versions
// //                 await counterCaller.deployed();

// //                 await counterCaller.decreaseCountByOne();

// //                 const currentCount = await counterV2.getCount();
// //                 expect(currentCount).to.eq(19);
                
// //             });
// //         }) 
        
        

// //     })
// // })


// // const { expect } = require("chai");
// // const { ethers } = require("hardhat");

// describe("CounterV2 and CounterV2Caller", function () {
//   let counterV2, counterV2Caller;
//   let owner, other;

//   beforeEach(async  () => {
//     [owner, other] = await ethers.getSigners();

//     const CounterV2 = await ethers.getContractFactory("CounterV2");
//     counterV2 = await CounterV2.deploy(owner.address);
//     // await counterV2.deployed();
//     await counterV2.deployed();
//     console.log("CounterV2 deployed at:", counterV2.address);
    
//     const CounterV2Caller = await ethers.getContractFactory("CounterV2Caller");
//     counterV2Caller = await CounterV2Caller.deploy(counterV2.address);
//     await counterV2Caller.deployed();

//   });

//   describe("CounterV2 basic tests", function () {
//     it("should deploy with count 0 and caller as msg.sender", async function () {
//       expect(await counterV2.count()).to.equal(0);
//       expect(await counterV2.caller()).to.equal(owner.address);
//     });

//     it("should allow caller to set count", async function () {
//       await counterV2.setCount(5);
//       expect(await counterV2.getCount()).to.equal(5);
//     });

//     it("should not allow non-caller to set count", async function () {
//       await expect(counterV2.connect(other).setCount(5)).to.be.revertedWith("Wrong caller");
//     });

//     it("should not allow setting count more than once", async function () {
//       await counterV2.setCount(5);
//       await expect(counterV2.setCount(10)).to.be.revertedWith("Count already has input value");
//     });

//     it("should increase count by one (caller only)", async function () {
//       await counterV2.setCount(5);
//       await counterV2.increaseCountByOne();
//       expect(await counterV2.getCount()).to.equal(6);
//     });

//     it("should revert increaseCountByOne if called by non-caller", async function () {
//       await counterV2.setCount(5);
//       await expect(counterV2.connect(other).increaseCountByOne()).to.be.revertedWith("Wrong caller");
//     });

//     // it("should decrease count by one (no restriction)", async function () {
//     //   await counterV2.setCount(5);
//     //   await counterV2.decreaseCountByOne();
//     //   expect(await counterV2.getCount()).to.equal(4);
//     // });

//     it("should reset count to zero if > 0 and by caller only", async function () {
//       await counterV2.setCount(5);
//       const tx = await counterV2.resetCount();
//       await tx.wait();
//       expect(await counterV2.getCount()).to.equal(0);
//     });

//     it("should revert resetCount if called by non-caller", async function () {
//       await counterV2.setCount(5);
//       await expect(counterV2.connect(other).resetCount()).to.be.revertedWith("Wrong caller");
//     });

//     it("should revert resetCount if count is already zero", async function () {
//       await expect(counterV2.resetCount()).to.be.revertedWith("Count value is empty");
//     });
//   });

//   describe("CounterV2Caller interaction", function () {
//     it("should call decreaseCountByOne through CounterV2Caller", async function () {
//       await counterV2.setCount(5);
//       await counterV2Caller.decreaseCountByOne();
//       expect(await counterV2.getCount()).to.equal(4);
//     });
//   });
// });


const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
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





























