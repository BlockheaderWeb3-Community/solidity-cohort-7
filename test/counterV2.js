const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const {expect} = require("chai");

//util function

const deployCounterV2 = async() => {
    // utill function doeas three things which are : target a contract, deploy a contract and return an instance of the contract

const CounterV2Contract = await ethers.getContractFactory("CounterV2");
const counterV2 = await CounterV2Contract.deploy();
return counterV2;
}

//Counter Test Suite
describe("Counter Test Suite", () => {
    describe("deployment", () =>{
        it("should return default values upon deployment", async ()=> {
            const counterV2 = await loadFixture(deployCounterV2); 
            expect(await counterV2.Counter()).to.eq(0);
        })

    })

})
