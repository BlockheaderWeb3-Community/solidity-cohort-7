// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MembershipNFT is ERC721{
    uint256 public tokenID;

    mapping (uint256 => address) public NFTowners;
    constructor() ERC721("AccessNFT", "ANT"){}
    
    function mint(address recipient) external returns(uint256){
     tokenID++;
     uint256 tokenId = tokenID;
     
     NFTowners[tokenId] = msg.sender;
    _mint(recipient, tokenId);
    return tokenId;
    }
}