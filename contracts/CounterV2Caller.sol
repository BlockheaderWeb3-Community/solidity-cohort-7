// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "../interfaces/ICounterV2.sol";
contract CounterV2Caller{
     ICounterV2 public icounterv2;

     constructor(address _counterV2address){
        icounterv2 = ICounterV2(_counterV2address);
     }

     function decreaseCount() public{
        icounterv2.decreaseCount();
     }
}