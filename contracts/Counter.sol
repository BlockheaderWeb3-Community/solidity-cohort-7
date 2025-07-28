// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ICounter {
    function setCount(uint256 _count) external;
    function increaseCountByOne() external;
    function getCount() external view returns (uint256);
}

contract Counter is ICounter {
    uint256 public count;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setCount(uint256 _count) external onlyOwner {
        require(_count <= 10, "Count must not exceed 10");
        count = _count;
    }

    function increaseCountByOne() external onlyOwner {
        require(count + 1 <= 10, "Count must not exceed 10");
        count += 1;
    }

    function getCount() external view returns (uint256) {
        return count;
    }
}

