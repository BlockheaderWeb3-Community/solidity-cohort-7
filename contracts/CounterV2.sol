// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface ICounterV2 {
    function getCount() external view returns(uint);
    function setCount(uint) external;
    function resetCount() external;
    function increaseCountByOne() external;
    function decreaseCountByOne() external;
}

contract CounterV2 is ICounterV2{
    uint public count;
    address owner;
    constructor(){
        owner = msg.sender;
    }

    function getCount() external view returns(uint){
        return count;
    }

    function setCount(uint _count) external{
        require(owner == msg.sender, "unauthorized address");
        require(_count >= 0);
        count = _count;
    }

    function resetCount() external {
        require(owner == msg.sender, "unauthorized address");
        require(count > 0, "cannot input default value");
        count = 0;
    }

    function increaseCountByOne() external{
        require(owner == msg.sender, "unauthorized address");
        count += 1;
    }

    function decreaseCountByOne() external{
        require(owner == msg.sender, "unauthorized address");
        require(count > 0, "count cannot go below zero");
        count -= 1;
    }
}