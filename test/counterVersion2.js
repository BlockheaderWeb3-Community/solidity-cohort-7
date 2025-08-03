// const {
//   loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// //const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// const deployCounter = async () => {
//   // target the CounterV2 contract within our contract folder
//   const CounterContract1 = await ethers.getContractFactory("CounterV2");
//   const counterV2 = await CounterContract1.deploy();

//   // target the CounterV2Caller contract within our contract folder
//   const CounterContract2 = await ethers.getContractFactory("CounterV2Caller");
//   const targetAddress = await counterV2.getAddress();

//   // deploy the contract with the target address we got from calling the getContractFactory() method on the ethers.js library passing in the target contract
//   const counterV2caller = await CounterContract2.deploy(targetAddress);
//   return { counterV2, counterV2caller }; // Returns the deployed contracts as an object
// };
// describe("Counter Test Suite", ()=>{

//     describe("Deployment ", ()=>{
//         it("Should return default values upon deployment", async ()=>{
//             const counter = await loadFixture(deployCounter);
//             // console.log("counter here: _____", counter);
            
//             expect(await counter.count()).to.eq(0);//assert that count=0 upon deployment
//         })
//     })

//     describe("Transactions", ()=>{
//         describe("Set Count", ()=>{
//             it("Should set appropriate count values", async ()=> {
//             const counter = await loadFixture(deployCounter);
//             let count1 = await counter.getCount();
//             expect(count1).to.eq(0);
//             await counter.setCount(10);

//             let count2 = await counter.getCount();
//             expect(count2).to.eq(10);
//         })

//         it("Should set appropriate multiple count values", async ()=> {
//             const counter = await loadFixture(deployCounter);
//             let count1 = await counter.getCount();
//             expect(count1).to.eq(0);
//             await counter.setCount(10);

//             let count2 = await counter.getCount();
//             expect(count2).to.eq(10);
//             await counter.setCount(20);
        

//             let count3 = await counter.getCount();
//             expect(count3).to.eq(20);
//             await counter.setCount(30);


//             let count4 = await counter.getCount();
//             expect(count4).to.eq(30);
//             await counter.setCount(40);


//             let count5 = await counter.getCount();
//             expect(count5).to.eq(40);
//             await counter.setCount(50);
//         })
//         })

//         describe("IncreaseByOne", ()=>{
//             it("Should increment by one", async ()=> {
//                 const increase = await loadFixture(deployCounter);
//                 let increase1 = await increase.getCount();
//                 expect(increase1).to.eq(0);
//                 await increase.increaseCountByOne();

//                 let increase2 = await increase.getCount();
//                 expect(increase2).to.eq(1);
//                 await increase.increaseCountByOne();
//             })

//             it("Should increment by multiple values", async ()=> {
//                 const increase = await loadFixture(deployCounter);
//                 let increase1 = await increase.getCount();
//                 expect(increase1).to.eq(0);
//                 await increase.increaseCountByOne();

//                 let increase2 = await increase.getCount();
//                 expect(increase2).to.eq(1);
//                 await increase.increaseCountByOne();

//                 let increase3 = await increase.getCount();
//                 expect(increase3).to.eq(2);
//                 await increase.increaseCountByOne();

//                 let increase4 = await increase.getCount();
//                 expect(increase4).to.eq(3);
//                 await increase.increaseCountByOne;


            
            


//         })
//     })

//     describe("Reset Count", ()=>{
//         it("Should reset the count to 0", async ()=>{
//             const { CounterV2 } = await loadFixture(deployCounter);
//             let count1 = await CounterV2.getCount();
//             expect(count1).to.eq(0);
//             await CounterV2.setCount(10);

//             let count2 = await CounterV2.getCount();
//             expect(count2).to.eq(10);
//             await CounterV2.setCount(40);

//             let count3 = await CounterV2.getCount();
//             expect(count3).to.eq(40);
//             await CounterV2.resetCount();

//             let count4 = await CounterV2.getCount();
//             expect(count4).to.eq(0);
//         })
//     })

//     describe("DecreaseCount", ()=>{
//         it("Should decrease count by 1", async ()=>{
//             const decrease = await loadFixture(deployCounter);
//             let decrease1 = await decrease.getCount();
//             expect(decrease1).to.eq(0);
//             await decrease.setCount(12);

//             let decrease2 = await decrease.getCount();
//             expect(decrease2).to.eq(12);
//             await decrease.decrement();

//             let decrease3 = await decrease.getCount();
//             expect(decrease3).to.eq(11);

//         })
//     })
        
//     })

 




// })