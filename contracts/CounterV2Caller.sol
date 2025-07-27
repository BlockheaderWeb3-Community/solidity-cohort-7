// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./CounterV2.sol";

contract CounterV2Caller is ICounterV2{
    ICounterV2 icv2;
    address contractAddr;

    constructor(address _contractaddr){
        contractAddr = _contractaddr;
        icv2 = ICounterV2(_contractaddr);
    }

    function setCount(uint _count) public {
        icv2.setCount(_count);
    }

    function getCount() public view returns(uint) {
        return icv2.getCount();
    }

    function increaseCountByOne() public {
        icv2.increaseCountByOne();
    }

    function resetCount() public {
        icv2.resetCount();
    }

    function decreaseCountByOne() public{
        icv2.decreaseCountByOne();
    }
}