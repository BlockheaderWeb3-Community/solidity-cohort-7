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
            expect(await counterV2.getCounter()).to.eq(0);
        })
        it("should set the owner to the deployer", async () => {
            const counterV2 = await loadFixture(deployCounterV2);
            const [owner] = await ethers.getSigners();
            expect(await counterV2.getOwner()).to.eq(owner.address);
        })
    })

describe("transactions",()=>{
    it("should revert if non-owner tries to set counter", async () => {
        const counterV2 = await loadFixture(deployCounterV2);
        const [, other] = await ethers.getSigners();
        await expect(counterV2.connect(other).setCounter(5)).to.be.revertedWith("who goes you!!");
    });

    it("set counter to a new value", async() => {
        const counterV2 = await loadFixture(deployCounterV2);
        // await counterV2.getCounter();
        let newCounter = await counterV2.getCounter();
        expect(newCounter).to.eq(0);

        await counterV2.setCounter(5);
        let newCounterV2 = await counterV2.getCounter();
        expect(newCounterV2).to.eq(5);
    
    })
    it("should revert if non owner try to call set counter", async ()=>{
        const counterV2 = await loadFixture(deployCounterV2);
        const [, other] = await ethers.getSigners();
        await expect(counterV2.connect(other).setCounter(5)).to.be.revertedWith("who goes you!!");
    })

    it("should revert if 0 is pass in as an argument", async()=>{
        const counterV2 = await loadFixture(deployCounterV2);
        await expect(counterV2.setCounter(0)).to.be.revertedWith("can't pass in 0 value argument");
    })
    
    it("should reset the counter to 0", async () => {
        const counterV2 = await loadFixture(deployCounterV2);

        await counterV2.setCounter(10);
        let newCounter = await counterV2.getCounter();
        expect(newCounter).to.eq(10);
        await counterV2.resetCounter();
        const resetCounter = await counterV2.getCounter();
        expect(resetCounter).to.eq(0);
   })
    it("should revert if non owner try to reset counter", async ()=> {
    const counterV2 = await loadFixture(deployCounterV2);
    const[,other] =await ethers.getSigners();
    await(expect(counterV2.connect(other).resetCounter()).to.be.revertedWith("who goes you!!"));
   })

    it("should call decrement from counterV2", async ()=> {
    //deploy the counterV2 contract and get the address
    const CounterV2 = await ethers.getContractFactory("CounterV2");
    const counterV2Instance = await CounterV2.deploy();
    await counterV2Instance.waitForDeployment(); 

    //deploy counterV2CallerWithTheAddress with the address of the counterV2 contract
    const CounterV2Caller = await ethers.getContractFactory("counterV2Caller");
    const counterV2CallerInstance = await CounterV2Caller.deploy(counterV2Instance.getAddress());
    await counterV2CallerInstance.waitForDeployment();

    //get the initial value of the counter
    let initialCounter = await counterV2Instance.getCounter();
    expect(initialCounter).to.eq(0);
 
    //set the counter
    await counterV2Instance.setCounter(5);
    let updatedCounter = await counterV2Instance.getCounter();
    expect(updatedCounter).to.eq(5);

    //call the decrement function from the counterV2Caller contract
    await counterV2CallerInstance.decrement();
    let newCount = await counterV2Instance.getCounter();
    expect(newCount).to.eq(4);
   })
   })
})
