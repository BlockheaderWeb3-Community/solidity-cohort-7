// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract ERC20 is IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    struct X {
        uint256 x;
        uint256 y;
    }

    // Experimental
    event DummyEvent(X indexed structA, X structB);

    uint256 public totalSupply;

    mapping(address account => uint256 balance) public balanceOf;
    mapping(address owner => mapping(address spender => uint256 amount))
        public allowance;

    string public name;
    string public symbol;
    uint8 public decimals;
    address public adminAddress;

    error InsufficientFundsError();
    error UnauthorizedError();

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _adminAddress
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        adminAddress = _adminAddress;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool) {
        // Verify that caller is not from address(0)
        require(msg.sender != address(0), "Invalid caller");

        // Verify that caller has enough tokens to send
        // require(balanceOf[msg.sender] >= amount, "Insufficient funds");
        if (balanceOf[msg.sender] < amount) {
            revert InsufficientFundsError();
        }

        balanceOf[msg.sender] = balanceOf[msg.sender] - amount;
        balanceOf[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    // Experimental
    function emitDummyEvent() public {
        X memory x;
        x.x = 1;
        x.y = 2;

        emit DummyEvent(x, x);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    function _mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;

        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;

        emit Transfer(from, address(0), amount);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == adminAddress, "Unauthorized");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(balanceOf[from] >= amount, "Insufficient funds");
        _burn(from, amount);
    }
}
