// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BlockToken is ERC20{

    address public owner;

    modifier onlyOwner {
        require(msg.sender == owner, "BlockToken:: Unauthorized User");
        _;
    }

    modifier notAmount0(uint256 _amount){
        require(_amount != 0, "BlockToken:: Zero amount not supported");
        _;
    }
    constructor(string memory _name, string memory _symbol, address _owner) ERC20(_name, _symbol){
        require(_owner != address(0), "BlockToken:: Zero address not supported");
        owner = _owner;
    }

    function mint(uint256 _amount, address _recepient) onlyOwner notAmount0(_amount) external {
        _mint(_recepient, _amount);
    }

    function burn(uint256 _amount) notAmount0(_amount) external {
        _burn(msg.sender, _amount);
    }

    function burnFrom(address _user, uint256 _amount)onlyOwner notAmount0(_amount) external {
        _burn(_user, _amount);
    }

    function transferToken(address _recepient, uint256 _amount) notAmount0(_amount) external {
        _transfer(msg.sender, _recepient, _amount);
    }

    function transferFromToken(address _sender, address _recepient, uint256 _amount) notAmount0(_amount) external {
        _transfer(_sender, _recepient, _amount);
    }

    function approveToken(address spender, uint256 _amount) notAmount0(_amount) external{
        _approve(msg.sender, spender, _amount);
    }

}
