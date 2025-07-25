// SPDX-License-Identifier: MIT

pragma solidity >= 0.7.0 < 0.9.0;

interface ICounterV2{
    function setCount(uint256 _count) external;
    function getCount() external  view returns(uint256);
    function resetCount() external;
    function decrementCount() external;
}

contract CounterV2 is ICounterV2{
    address public owner;
    uint256 public count;

    constructor(){
        owner = msg.sender;
    }

    function setCount(uint256 _count) external {
        require(msg.sender == owner, "Unauthorized Caller");
        require(_count > 0, "Cannot pass zero value as argument"); 

        count = _count;
    }

    function getCount() external view returns(uint256) {
        return count;
    }

    function resetCount() external {
        require(msg.sender == owner, "Unauthorized Caller");
        if (count > 0) {
            count = 0;
        }
    }

    function decrementCount() external {
        count -= 1;
    }
}

contract CounterV2Caller {
    ICounterV2 public _iCounterV2;
    address public contractCounterV2Address;

   constructor(address _contractCounterV2Address) {
    contractCounterV2Address = _contractCounterV2Address;
    _iCounterV2 = ICounterV2(_contractCounterV2Address);
   }

    function callDecrement() external {
        _iCounterV2.decrementCount();
    }
}

// Reset count (if count > 0, then count =0) and to be called by only owner
// Set count (if count === 0, else cannot pass in zero value as arg) and only owner should set count
// write an Interface
// Decrement function (count by 1)
// Create an instance of counter v2 where it will decrease the counter