// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/ICounterV2.sol";

// interface ICounterV2{
//   function setCount(uint count) external;
//   function getCount() external returns (uint);
//   function resetCount() external;
//   function decreaseCount() external;
// }

// contract CounterV2 {
contract CounterV2 is ICounterV2{

  uint count;
  address owner;

  constructor(){
    owner = msg.sender;
  }

    // modifier onlyOwner() {
    //     require (owner == msg.sender, "unauthorized");
    //     _;
    // }

  function setCount(uint _count) public {
    require(owner == msg.sender, "unauthorized");
    require(_count<=10, "count should not be greater than 10");
    count = _count;
  }

  function getCount() public view returns(uint){
    return count;
  }

  function resetCount() public{
    require(owner == msg.sender, "unauthorized");
    count = 0;
  }

  function decreaseCount() public{
    count -= 1;
  }

  function increaseCount() public{
    count+=1;
  }

}

// contract CounterV2Caller{
//      ICounterV2 public icounterv2;

//      constructor(address _counterV2address){
//         icounterv2 = ICounterV2(_counterV2address);
//      }

//      function decreaseCount() public{
//         icounterv2.decreaseCount();
//      }
// }