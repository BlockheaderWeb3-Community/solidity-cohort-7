const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { extendProvider } = require("hardhat/config");

//util function
const deployCounter = async () => {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();

    return counter;
}

// Counter Test Suite
describe("Counter Test Suite", () => {
    describe("Deployment", () =>{
        it("Should return default value upon deployment", async () =>{
            const counter = await loadFixture(deployCounter);
            expect(await counter.count()).to.eq(0);
        })
    })

    describe("Transcation", () =>{
        describe("setCount", () => {
            it("Should set appropriate count values", async () =>{
                const counter = await loadFixture(deployCounter); //extract deployed contract instance
                let count1 = await counter.getCount();
                expect(count1).to.eq(0);

                await counter.setCount(10);

                let count2 = await counter.getCount();
                expect(count2).to.eq(10);

            })

            it("Should set appropriate count values in mutiple instance", async () =>{
                const counter = await loadFixture(deployCounter); //extract deployed contract instance
                let count1 = await counter.getCount();
                expect(count1).to.eq(0);

                await counter.setCount(10);

                let count2 = await counter.getCount();
                expect(count2).to.eq(10);

                await counter.setCount(5);

                let count3 = await counter.getCount();
                expect(count3).to.eq(5);

                await counter.setCount(15);

                let count4 = await counter.getCount()
                expect(count4).to.eq(15);
            })    
        
        })

        describe("IncreaseCountByOne", () => {

            it("Should increase count by one", async () =>{
                const counter = await loadFixture(deployCounter); //extract deployed contract instance
                let count1 = await counter.getCount();
                expect(count1).to.eq(0);

                await counter.increaseCountByOne();

                let count2 = await counter.getCount();
                expect(count2).to.eq(1);

            })

            it("Should first set count then increase count by one in multiple instances", async () =>{
                const counter = await loadFixture(deployCounter); //extract deployed contract instance
                await counter.setCount(100);

                let count1 = await counter.getCount();
                expect(count1).to.eq(100);

                await counter.increaseCountByOne();

                let count2 = await counter.getCount();
                expect(count2).to.eq(101);

                await counter.increaseCountByOne();

                let count3 = await counter.getCount();
                expect(count3).to.eq(102);

                await counter.increaseCountByOne();

                let count4 = await counter.getCount();
                expect(count4).to.eq(103);
            })
        })
    })
})
