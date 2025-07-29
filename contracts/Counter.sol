// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ICounterV2 {
    function setCount(uint256 _count) external;
    function increaseCountByOne() external;
    function getCount() external  view returns(uint256);



}

contract Counter is ICounterV2 {
    address public owner;
    uint256 public count;



    function setCount(uint256 _count) external {
        require(owner == msg.sender, "Unathorized");
        count = _count;
    }

    function increaseCountByOne() public {
        require(msg.sender == owner, "Unauthorized");
        count += 1;
    }

    function getCount() public view returns(uint256) {
        return count;
    }



    }


