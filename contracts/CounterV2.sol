// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

interface IcounterV2 {
    function resetcounter() external;
    function setcounter(uint256 _counter) external returns (uint256);
    function decrement() external;
}

contract counterV2 is IcounterV2 {
    address private owner;
    uint256 public counter;
    constructor() {
        owner = msg.sender;
    }

    function resetcounter() external onlyOwner {
        if (counter > 0) {
            counter = 0;
        }
    }

    function setcounter(
        uint256 _counter
    ) external view onlyOwner returns (uint256) {
        require(_counter == 0, "can't pass in 0 value argument");
        return _counter;
    }

    function decrement() external {
        counter -= 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "who goes you!!");
        _;
    }
}

contract counterV2Caller {
    IcounterV2 public _icounterV2;
    address public contractAddress;
    constructor(address _contractAddress) {
        contractAddress = _contractAddress;
        _icounterV2 = IcounterV2(contractAddress);
    }

    function decrement() external {
        _icounterV2.decrement();
    }
}
