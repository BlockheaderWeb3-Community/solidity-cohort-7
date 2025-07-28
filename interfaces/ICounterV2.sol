// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ICounterV2{
  function setCount(uint count) external;
  function getCount() external returns (uint);
  function resetCount() external;
  function decreaseCount() external;
}