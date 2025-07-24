// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract allowance{
    mapping(address => mapping(address => uint)) public allowance;
   
   function setAllowance(address _addrOwner, address _addrSpender, uint _Index) public{
    allowance[_addrOwner][_addrSpender]=_Index;
   }

    function remove(address _addrOwner, address _addrSpender) public{
        delete allowance[_addrOwner][_addrSpender];
    }

    function getAllowance(address _addrOwner, address _addrSpender) public view returns(uint256){
        allowance[_addrOwner][_addrSpender];
    }
}