// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

interface ICounter {
    function increaseCountByOne() external;
    function setCount(uint256 _count) external;

    function getCount() external  view returns(uint256);
    //function resetCount() external
}


contract Counter is ICounter {
    uint256 public count;

    function increaseCountByOne() public {
        count += 1;
    }

    function setCount(uint256 _count) public {
        count = _count;
    }

    function getCount() public view returns(uint256) {
        return count;
    }

 
}