// const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// // const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { expect } = require("chai");

// // util functon 
// const deployCounter = async () => {
//     // target the Counter contract within our contract folder
//     const CounterContract = await ethers.getContractFactory("Counter"); // target Counter.sol
//     const counter = await CounterContract.deploy(); // deploy the Counter contract
//     return counter ; // return the deployed instance of our counter contract
// }

// // Counter Test Suite  
// describe("Counter Test Suite", () => {
//     describe("Deployment", () => {
//         it("Should return default values upon deployment",  async () => {
//             const  counter  = await loadFixture(deployCounter);
//             expect(await counter.count()).to.eq(0); // assert that count = 0 upon deployment
//         })
//     })

//     describe("Transactions", () => {
//         describe("SetCount", () => {
//             it("Should set appropriate count values",  async () => {
//                 const  counter  = await loadFixture(deployCounter); // extract deployed counter instance
//                 let count1 = await counter.getCount(); // check initial count value before txn
//                 expect(count1).to.eq(0);
//                 await counter.setCount(10) // assert that count = 0 upon deployment
    
//                 let count2 = await counter.getCount(); // check initial count value before txn
//                 expect(count2).to.eq(10) // check final count = 10
//             })

//             it("Should set appropriate values for multiple setCount txns",  async () => {
//                 const counter = await loadFixture(deployCounter);
               
//                 let count5 = await counter.getCount();
//                 expect(count5).to.eq(0);
//                 await counter.setCount(25);

//                 let count6 = await counter.getCount();
//                 expect(count6).to.eq(25);
//                 await counter.setCount(30);

//                 let count7 = await counter.getCount();
//                     expect(count7).to.eq(30);
//                 await counter.setCount(35)
//             })
//         })

//         describe("IncreaseCountByOne", () => {
//             it("Should set appropriate increaseCountByOne value",  async () => {
//                  const counter = await loadFixture(deployCounter);

//                 let count10 = await counter.getCount();
//                 expect(count10).to.eq(0);
//                 await counter.increaseCountByOne();

//                 let count11 = await counter.getCount();
//                 expect(count11).to.eq(1); 
//                 await counter.increaseCountByOne();

//                 let count12 = await counter.getCount();
//                 expect(count12).to.eq(2);
//            })
                


//             it("Should set appropriate values for multiple increaseCountByOne txns on different instances", async () => {
//               const Counter = await ethers.getContractFactory("Counter");

//             const counter1 = await Counter.deploy();
//             await counter1.increaseCountByOne(); 
//             const count1 = await counter1.getCount();
//             expect(count1).to.eq(1); 

//             const counter2 = await Counter.deploy();
//             await counter2.increaseCountByOne(); 
//             await counter2.increaseCountByOne();
//             const count2 = await counter2.getCount();
//             expect(count2).to.eq(2); 

//             const counter3 = await Counter.deploy();
//             await counter3.increaseCountByOne(); 
//             await counter3.increaseCountByOne();
//             await counter3.increaseCountByOne(); 
//             const count3 = await counter3.getCount();
//             expect(count3).to.eq(3);

//             const counter4 = await Counter.deploy();
//             await counter4.increaseCountByOne();
//             await counter4.increaseCountByOne();
//             await counter4.increaseCountByOne();
//             await counter4.increaseCountByOne();
//             const count4 = await counter4.getCount();
//             expect(count4).to.eq(4);
//             });


//         })
//     })
// })