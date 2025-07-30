// const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// //const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs"),
// const { expect } = require("chai");

// //util function
// //target the counter contract within our contract folder

// const deployCounter = async () => {
//         //contracts are deployed using first signer/account by default
//          //const [owner, otherAccount] = await ethers.getSigners();

//     const CounterContract = await ethers.getContractFactory("Counter"); //target counter.sol
//     const counter = await CounterContract.deploy(); // deply the Counter contract

//     return counter ; // return the deplyed instance of our counter contract
// }
// //Counter Test Suite
// describe("Counter Test, Suite", () => {
//     describe("Deployment", () => {
//         it("Should return default values upon deployment", async () => {
//             const counter  = await loadFixture(deployCounter);
//             expect(await counter.getCount()).to.eq(0); //assert that count =0
//             //console.log("counter here: ____", counter);
//         })
//     })
    
//     describe("Transactions", () => {
//         it("setCount", async () => {
//             const counter  = await loadFixture(deployCounter); //extract deployed counter insatnce
            
//             let count1 = await counter.getCount(); //check initial count value before txn
//             expect(count1).to.eq(0);
//             await counter.setCount(10);

//             let count2 = await counter.getCount(); //check initial count value before txn
//             expect(count2).to.eq(10);
//             //expect(await counter.setCount()).to.eq(0);
//         });
//          it("Should set appropriate values for multiple setCount txns",  async () => {
//             const counter  = await loadFixture(deployCounter); //extract deployed counter insatnce
            
//                let count2 = await counter.getCount(); // check initial count value before txn
//                 expect(count2).to.eq(0);
//                 await counter.setCount(20);

//                 let count3 = await counter.getCount(); // check initial count value before txn
//                 expect(count3).to.eq(20);
//                 await counter.setCount(30);
//                 let count4 = await counter.getCount();
//                 expect (count4).to.eq(30);
//                 await counter.setCount(50);
//             })
//         });

//     describe("IncreaseCountByOne", () => {
//        it("Should set appropriate increaseCountByOne value", async () => {
//            const counter  = await loadFixture(deployCounter); //extract deployed counter insatnce
//            await counter.increaseCountByOne();
//            expect(await counter.getCount()).to.eq(1);
//        });

//        it("Should set appropriate values for multiple increaseCountByOne txns", async () => {
//            const counter  = await loadFixture(deployCounter); //extract deployed counter insatnce
//            await counter.increaseCountByOne();
//            await counter.increaseCountByOne();
//            await counter.increaseCountByOne();
//            expect(await counter.getCount()).to.eq(3);
//         });
//      });
// });