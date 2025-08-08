// SPDX-License-Identifier: MIT
// This is a Token-Gated Membership System where users gain access to exclusive features by holding a minimum amount of ERC20 tokens and are awarded ERC721 membership NFTs for elite participation.

pragma solidity ^0.8.15;

// Import contracts for Token and NFT 
import {MembershipNFT} from "src/MembershipNFT.sol";
import {AccessToken} from "src/AccessToken.sol";

contract MembershipManager {
    AccessToken public accessToken;
    MembershipNFT public membershipNFT;

    // State variables
    address public AccessTokenOwner;
    address public owner;
    uint256 public minThreshold;

     modifier onlyOwner {
        require(msg.sender == owner, "MembershipManager:: Unauthorized User");
        _;
    }

    modifier onlyAccessTokenOwner {
        require(msg.sender == AccessTokenOwner, "Unauthorized to call access token");
        _;
    }

    // Custom errors
    error AmountTooHigh();
    // error InsufficientBalance();
    // error UnauthorizedClaim();

    constructor(address _deployedAccessToken, address _deployedNFT, address _owner) {
        accessToken = AccessToken(_deployedAccessToken);
        membershipNFT =  MembershipNFT(_deployedNFT);
        owner = msg.sender;
        AccessTokenOwner = _owner;
    }

    mapping (address => uint256) public balances;
    mapping (address => bool) public hasClaimed;

    function setMinThreshold(uint256 _newThreshold) external onlyOwner() {
        minThreshold = _newThreshold;
    }

    function giveAccessToken(address to, uint256 amount) external onlyAccessTokenOwner() {
        accessToken.transfer(to, amount);
    }

    function claimMembershipNFT() external returns(uint256) {
        // if (accessToken.balanceOf(msg.sender) < MAX_AMOUNT) {revert InsufficientBalance();}
        require(accessToken.balanceOf(msg.sender) >= minThreshold, "You dont have access to mint");
        require(!hasClaimed[msg.sender], "Claimed NFT already");
        hasClaimed[msg.sender] = true;
        
        uint256 tokenId = membershipNFT.mint(msg.sender);
        return tokenId;
    }

    function getOwner() external view returns(address) {
        return owner;
    }
}

