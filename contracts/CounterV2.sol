// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICounterV2{
    function setCount(uint256 _count) external;

    function getCount() external  view returns(uint256);

    function increaseCountByOne() external;

    function resetCount() external;

    function decreaseCountByOne() external; 
}

contract CounterV2 is ICounterV2 {
    uint256 public count;
    address owner;

    constructor(){
        owner = msg.sender;
    }

    function setCount(uint256 _count) public {
        require(_count > 0, "Count must be greater than 0");
        require(msg.sender == owner, "You are unauthorised");
        count = _count;
    }

    function getCount() public view returns(uint256) {
        return count;
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function increaseCountByOne() public {
        require(msg.sender == owner, "You are unauthorised");
        count+=1;
    }

    function resetCount() public {
        require(count != 0,"Cannot reset value , It's already at default");
        require(msg.sender == owner, "You are unauthorised");
        delete count;
    }

    function decreaseCountByOne() public {
        require(msg.sender == owner, "You are unauthorised");
        count-=1;
    }
}

