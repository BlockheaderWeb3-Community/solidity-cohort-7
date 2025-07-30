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
//                 const  counter  = await loadFixture(deployCounter); //  A demo disployment of an instance, extract deployed counter instace
//                 let count1 = await counter.getCount(); // check initial count value before txn
//                 expect(count1).to.eq(0);
//                 await counter.setCount(10) // assert that count = 0 upon deployment
    
//                 let count2 = await counter.getCount(); // check initial count value before txn
//                 expect(count2).to.eq(10) // check final count = 10

//             })

//             it("Should set appropriate values for multiple setCount txns",  async () => {
//                 const  counter  = await loadFixture(deployCounter); // extract deployed counter instace
//                 let count1 = await counter.getCount(); // check initial count value before txn
//                 expect(count1).to.eq(0);
//                 await counter.setCount(10) // assert that count = 0 upon deployment

//                  let count2 = await counter.getCount(); // check initial count value before txn
//                  expect(count2).to.eq(10);
//                  await counter.setCount(20)

//                  let count3 = await counter.getCount(); // check initial count value before txn
//                  expect(count3).to.eq(20);
//                  await counter.setCount(30)

//                 let count4 = await counter.getCount(); // check initial count value before txn
//                  expect(count4).to.eq(30);
//                  await counter.setCount(40)
                               
//             })
//         })

//         describe("IncreaseCountByOne", () => {
//             // it("Should set appropriate increaseCountByOne value",  async () => {
//             //     const  counter  = await loadFixture(deployCounter); // extract deployed counter instace
//             //     let count1 = await counter.getCount(); // check initial count value before txn
//             //     expect(count1).to.eq(0);

//             //     await counter.increaseCountByOne(); // assert that count = 0 upon deployment
//             //     let count2 = await counter.getCount(); // check initial count value before txn
//             //     expect(count1).to.eq(0);
             
                
//             // })

//             it("Should set appropriate values for multiple increaseCountByOne txns",  async () => {
//               const  counter  = await loadFixture(deployCounter); // extract deployed counter instace
//                 let count1 = await counter.getCount(); // check initial count value before txn
//                 expect(count1).to.eq(0);
//                 await counter.setCount(50)

//                 // await counter.increaseCountByOne(s);
//                 let count2 = 50
//                 // expect(count2).to.eq(50);
                
//                 while (count2 < 50) {
//                     console.log(count2);
//                     count2++;
//                 }
//                 // for (let index = 0; index < 51; index++) {
//                 await counter.increaseCountByOne();

//                 // },

//                 // let count3 = await counter.getCount(); // check initial count value before txn
//                 // expect(count3).to.eq(101);

            
                

//             })
//         })
//     })
// })