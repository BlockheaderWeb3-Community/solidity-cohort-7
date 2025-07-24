// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import "./interfaces/IERC20.sol";


contract ERC20 is IERC20{
    event Transfer ( address indexed from, address indexed to, uint256 value);
    event Approval (address indexed owner, address indexed spender, uint value);

    uint public  totalSupply;

    mapping (address account => uint balance) public balanceOf;
    mapping  (address owner => mapping  (address spender => uint amount)) public allowance;
    string public name;
    string public symbol;
    uint8 public decimals;
    address public  adminAddress;

    constructor (string memory _name, string memory _symbol, uint8 _decimals, address _adminAddress){
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        adminAddress = _adminAddress;
    }
        //transfer event in SOLIDITY
    function transfer (address recipient, uint amount) external returns (bool){
        // verify that the caller has enough token to send
        require(balanceOf [msg.sender] >= amount, "Insufficent funds");
        // verify that caller is not from address (0)
        require(msg.sender != address (0), "Invalid caller");

        balanceOf [msg.sender] = balanceOf[msg.sender] - amount; //balance[msg.sender] -= amount
        balanceOf[recipient] = balanceOf[msg.sender] += amount; //balance[msg.sender] += amount

        emit Transfer (msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool){
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(address from, address to, uint amount) external returns (bool){
    //allowance and balance checks
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(from != address(0) && to != address(0), "Invalid address");


        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    function _mint(address to, uint amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;

        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;

        emit Transfer(from, address(0), amount);
    }

    function mint(address to, uint amount) external {
        require(msg.sender == adminAddress, "Unauthorized");
        _mint(to, amount);
    }

    function burn(address from, uint amount) external {
         require(msg.sender == adminAddress, "Unauthorized");
        require(balanceOf[from] >= amount, "Insufficent");
        _burn(from, amount);
    }
    //If the adminAddress is compromised or needs to be updated
    function transferAdmin(address newAdmin) external {
        require(msg.sender == adminAddress, "Only admin");
        require(newAdmin != address(0), "Invalid new admin");
        adminAddress = newAdmin;
}


}