//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface MeCounterV2 {
    function resetCount() external;
    function setCount(uint256 _count) external;
    function decreaseCount() external;
    function increaseCountByOne() external;
    function getCount() external  view returns(uint256);
    
}

contract CounterV2 is MeCounterV2 {
    uint256 public count;
    address owner;

    constructor() {
        owner = msg.sender;
    }

    function setCount(uint256 _count) public {
        require(_count > 0, "Cannot pass in 0 value as argument");
        require(msg.sender == owner, "Unauthorized User: Only owner can alter the count");
        count = _count;
    }


    function increaseCountByOne() public {
        require(msg.sender == owner, "Unauthorized User");
        count += 1;
    }

    function getCount() public view returns(uint256) {
        // require(msg.sender == owner, "Unauthorized User");
        return count;
    }

    function resetCount() public {
        require(msg.sender == owner, "Unauthorized User");
        if (count > 0) {
            count = 0;
        }
    }

    function decreaseCount() external {
        count -= 1;
    }
}

contract CounterV2Caller{
    MeCounterV2 public _MeCounterV2;
    address public contractCountV2Add;

    constructor (address _contractCountV2Add) {
        contractCountV2Add = _contractCountV2Add;
        _MeCounterV2 = MeCounterV2 (_contractCountV2Add); 
    }

    function decreementCaller() external {
        _MeCounterV2.decreaseCount();
    }

}