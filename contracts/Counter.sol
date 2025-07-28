// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ICounterV2 {
    function setCount(uint256 _count) external;
    function increaseCountByOne() external;
    function getCount() external  view returns(uint256);
    function decreaseCountByOne() external;
    function resetCount() external;


}

contract Counter is ICounterV2 {
    address public owner;
    uint256 public count;

    constructor(){
        owner = msg.sender;
    }

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

    function resetCount() public {
        count = 0;
    }

    function decreaseCountByOne() external{
        require(msg.sender == owner, "Unauthorized");
        count -= 1;
    }

    function getOwner() public view returns(address{
        return owner;
    }
}

contract  callerICounterV2{
    ICounterV2 public _IC;
    address contractAddress;
    address public owner;

    constructor(address _contractAddress){
        contractAddress = _contractAddress;
        _IC = ICounterV2(contractAddress);
        owner = msg.sender;
    }

    function callDecreaseCountByOne(){
        require(owner == msg.sender, "Unathorized");
        _IC.decreaseCountByOne;
    }
}