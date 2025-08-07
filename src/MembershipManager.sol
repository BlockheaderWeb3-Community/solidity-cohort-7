// SPDX-License-Identifier: MIT
// This is a Token-Gated Membership System where users gain access to exclusive features by holding a minimum amount of ERC20 tokens and are awarded ERC721 membership NFTs for elite participation.

pragma solidity ^0.8.15;

// Import contracts for Token and NFT 
import {MembershipNFT} from "src/MembershipNFT.sol";
import {AccessToken} from "src/AccessToken.sol";

contract MembershipManager {
    AccessToken public _accessToken;
    MembershipNFT public _membershipNFT;

    // State variables
    address public owner;
    uint256 public MAX_AMOUNT = 50;
    uint256 public minAmount;

    // Custom errors
    error AmountTooHigh();
    error InsufficientBalance();
    error UnauthorizedAccess();
    error UnauthorizedClaim();

    constructor(address _deployedAccessToken, address _deployedNFT, address _owner) {
        _accessToken = AccessToken(_deployedAccessToken);
        _membershipNFT =  MembershipNFT(_deployedNFT);
        owner = _owner;
    }

    // Mapping for balances of Tokens and if a user has claimed NFT prior
    mapping (address => uint256) public balances;
    mapping (address => bool) public hasClaimed;

    function setMinimumThreshold(uint256 _newMinAmount) external {
        if (msg.sender != _accessToken.getOwner()) { revert UnauthorizedAccess();}
        minAmount = _newMinAmount;
    }

    function getAccessToken(uint256 amount) external {
        if (amount > MAX_AMOUNT) {revert AmountTooHigh();}

        _accessToken.transfer(msg.sender, amount);
        balances[msg.sender] += amount;
    }

    function claimMembershipNFT() external returns(uint256) {
        if (_accessToken.balanceOf(msg.sender) < MAX_AMOUNT) {revert InsufficientBalance();}
        if (hasClaimed[msg.sender] == true) { revert UnauthorizedClaim();}
        hasClaimed[msg.sender] = true;
        
        uint256 tokenId = _membershipNFT.mint(msg.sender);
        return tokenId;
    }
}

