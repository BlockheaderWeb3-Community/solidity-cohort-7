# Token-Gated Membership System

This project implements a token-gated membership system using Solidity smart contracts. Users gain access to exclusive features by holding a minimum balance of ERC20 tokens and can earn ERC721 membership NFTs for elite participation.

## Overview

The system is composed of three core smart contracts:

- **AccessToken** – An ERC20 token that acts as the gateway to access gated features.
- **MembershipNFT** – An ERC721 token that represents exclusive membership.
- **MembershipManager** – A control contract that governs access logic, token distribution, and NFT minting.

## Smart Contracts

### [`AccessToken`](src/AccessToken.sol)

- An ERC20 token named **AccessToken** with the symbol **ACS**.
- Minting is restricted to the contract owner.
- Serves as the entry requirement for accessing membership features.

### [`MembershipNFT`](src/MembershipNFT.sol)

- An ERC721 token named **AccessNFT** with the symbol **ANT**.
- Each token represents a unique elite membership.
- Minting is exclusively handled by the `MembershipManager`.

### [`MembershipManager`](src/MembershipManager.sol)

- Coordinates the token-gated logic and NFT reward system.
- Allows users to claim a limited amount of `AccessToken`.
- Enables users who meet the token threshold to claim a `MembershipNFT`.
- Maintains user state, including token balances and NFT claims.
- Admin can configure the minimum token requirement for NFT eligibility.

## Contract Live Addresses

1: contract AccessToken - 0xaB22202CBC4c8035a436C666945138616342B7b1
2: contract MembershipNFT - 0xaFE66a4A121e293A4eb6388caBa8609588263462
3: contract MembershipManager - 0x3Bbc0CDac42B23EbaE035F7d8Dd234c6c1A9F1CD
