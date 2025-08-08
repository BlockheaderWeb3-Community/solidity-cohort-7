// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
contract AccessToken is ERC20{

    address private owner;

    modifier onlyOwner {
        require(msg.sender == owner, "AccessToken:: Unauthorized User");
        _;
    }

    constructor() ERC20("Access Token", "ACT"){
        owner = msg.sender;
        _mint(msg.sender, 1000000);
    }
    
    function mint(address to, uint256 _amount) onlyOwner external {
        _mint(to, _amount);
    }

    function getOwner() external view returns(address) {
        return owner;
    }
}