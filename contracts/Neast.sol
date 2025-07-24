// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 < 0.9.0;

contract Allowance {
    mapping(address => mapping(address => uint256)) public allowance;

    function setAllowance(
        address _addrOwner,
        address _addrSpender,
        uint256 _index
    ) public {
    allowance[_addrOwner][_addrSpender] = _index;
    }

    function getAllowance(address _addrOwner, address _addrSpender)
        public
        view
        returns (uint256)
        {
        return allowance[_addrOwner][_addrSpender];
        }

    function remove(address _addrOwner, address _addrSpender) public {
    delete allowance[_addrOwner][_addrSpender];
    }
}