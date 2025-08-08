// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import {ERC721} from "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract MembershipNFT is ERC721{
    uint256 public tokenId;

    // mapping (uint256 => address) public NFTowners;
    constructor() ERC721("Membership NFT", "MNFT"){}
    
    function mint(address recipient) external returns(uint256){
     tokenId++;
     uint256 _tokenId = tokenId;
     
    //  NFTowners[_tokenId] = msg.sender;
    _mint(recipient, _tokenId);
    return tokenId;
    }
}