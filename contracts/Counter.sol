// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ICounter {
    function setCount(uint256 _count) external;
    function increaseCountByOne() external;
    function getCount() external  view returns(uint256);

}

contract Counter is ICounter {
    uint256 public count;

    function setCount(uint256 _count) external {
        count = _count;
    }

    function increaseCountByOne() public {
        count += 1;
    }

    function getCount() public view returns(uint256) {
        return count;
    }
}