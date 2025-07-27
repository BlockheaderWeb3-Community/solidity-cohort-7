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
    function increaseCountByOne() external {
        count += 1;
    }

    function getCount() external view returns(uint256) {
        return count;
    }
}