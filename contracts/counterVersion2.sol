// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

interface ICounterV2 {
    function setCount(uint256 _count) external;
    function increaseCountByOne() external;
    function getCount() external  view returns(uint256);
    function resetCount() external ;
    function decrement() external;
}


contract CounterV2 is ICounterV2 {
    uint256 public count;
    address public owner;

    constructor(){
        owner = msg.sender;
    }


    function setCount(uint256 _count) public {
        require(msg.sender == owner, "You are not the owner");
        require(_count > 0, "You cannot pass 0 value");
        count = _count;
    }

    function increaseCountByOne() public {
        count += 1;
    }

    function getCount() public view returns(uint256) {
        return count;
    }

    function resetCount() external{
        require(msg.sender == owner, "You are not the owner");
        if(count > 0){
            count = 0;
        }
    }

    function decrement() external{
        count -= 1;
    }
}

contract CounterV2Caller{
    ICounterV2 public iCounterV2;


     function decrementCaller() external{
         iCounterV2.decrement();
     }
}