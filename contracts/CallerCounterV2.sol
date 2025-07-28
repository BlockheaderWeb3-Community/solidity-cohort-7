// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICounterV2{
    function setCount(uint256 _count) external;

    function getCount() external  view returns(uint256);

    function increaseCountByOne() external;

    function resetCount() external;

    function decreaseCountByOne() external; 
}

contract CallerCounterV2 {
    ICounterV2 icounterv2;
    address counterV2addr;

    constructor(address _counterV2Addr) {
        counterV2addr = _counterV2Addr;
        icounterv2 = ICounterV2(counterV2addr);
    }

    function decreaseCountByOne() public  {
        icounterv2.decreaseCountByOne();
    }
    function incrementCountByOne() public {
        icounterv2.increaseCountByOne();
    }

    function setCount(uint256 _count) public {
        icounterv2.setCount(_count);
    }

    function resetCount() public {
        icounterv2.resetCount();
    }

    function getCount() public view returns(uint256 count) {
       count = icounterv2.getCount();
    }
}