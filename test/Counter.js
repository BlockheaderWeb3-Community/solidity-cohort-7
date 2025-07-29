const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const { expect } = require("chai");

// util deploy function

const deployCounter = async ()=>{
    
    // Contracts are deployed using the first signer/account by default
        // const [owner, otherAccount] = await ethers.getSigners();

        const CounterContract = await ethers.getContractFactory("Counter");
        const counter = await CounterContract.deploy(); //deploy the contract

        return counter; //return the deployed instances of our counter contract
}  

// 
describe("counter test suit", ()=>{
    describe("Deployment", ()=>{
        it("Should return default values upon deployment", async()=>{
            const counter = await loadFixture(deployCounter); //load the fixture to deploy the contract
            expect(await counter.getCount()).to.equals(0); // assert that counter = 0 upon deployment
            // console.log("Counter here: _____", counter);
        })
    })

    describe("Transactions", ()=>{ 

    describe("Set count", ()=>{
        it("Should set appropriate count value", async()=>{
            const counter = await loadFixture(deployCounter); //extract deployed contract instance

            let count1 = await counter.getCount();
            expect(await count1).to.eq(0);// assert that counter = 0 upon deployment
            await counter.setCount(10);

            let count2 = await counter.getCount();
            expect(count2).to.eq(10); 
            
        })

        it("Should set appropriate values for multiples set count txns", async()=>{
            const counter = await loadFixture(deployCounter);

            let count3 = await counter.getCount();
            expect(count3).to.eq(0); //asset count value is 0
            await counter.setCount(5); //set count value = 5

            expect(await counter.getCount()).to.eq(5);
            await counter.setCount(10);

            expect(await counter.getCount()).to.eq(10);
            await counter.setCount(30);

            expect(await counter.getCount()).to.eq(30);


        })
    })
    describe("Increase count by one ", ()=>{
        it("Should set appropriately increase count value by one", async()=>{
            const counter = await loadFixture(deployCounter); //extract deployed contract instance

            let count = await counter.getCount();
            expect(count).to.eq(0);

            await counter.increaseCountByOne();
            expect(await counter.getCount()).to.eq(1);
        })

        it("Should set appropriately increase count value by one multiple txns", async()=>{
            const counter = await loadFixture(deployCounter); //extract deployed contract instance

            let count = await counter.getCount();
            expect(count).to.eq(0);
            await counter.increaseCountByOne();

            expect(await counter.getCount()).to.eq(1);
            await counter.increaseCountByOne();

            expect(await counter.getCount()).to.eq(2);
            await counter.increaseCountByOne();

            expect(await counter.getCount()).to.eq(3);
            await counter.increaseCountByOne();

            expect(await counter.getCount()).to.eq(4);


        })
    })
    
})
})