// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAccessToken {
    function balanceOf(address account) external view returns (uint256);
}

interface IMembershipNFT {
    function mint(address to) external;
}

import "@openzeppelin/contracts/access/Ownable.sol";

contract MembershipManager {
    IAccessToken public accessToken;
    IMembershipNFT public membershipNFT;
    uint256 public minTokenThreshold = 1000 * 1e18;
    address public owner;

    constructor(address _token, address _nft,address _owner)  {
        accessToken = IAccessToken(_token);
        membershipNFT = IMembershipNFT(_nft);
        owner=_owner;
    }


    modifier onlyOwner {
        require(msg.sender == owner, "BlockToken:: Unauthorized User");
        _;
    }

    

    function setMinTokenThreshold(uint256 newThreshold) external onlyOwner {
        minTokenThreshold = newThreshold;
    }

    function claimMembership() external {
        require(
            accessToken.balanceOf(msg.sender) >= minTokenThreshold,
            "Insufficient token balance"
        );

        membershipNFT.mint(msg.sender);
    }
}
