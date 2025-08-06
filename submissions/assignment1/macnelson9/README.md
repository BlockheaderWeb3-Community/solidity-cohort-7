# Token-Gated Membership System

This project implements a token-gated membership system using Solidity smart contracts. Users gain access to exclusive features by holding a minimum amount of ERC20 tokens and are awarded ERC721 membership NFTs for elite participation.

## Overview

The system consists of three main contracts:

- **AccessToken**: An ERC20 token contract used to gate access to membership features.
- **MembershipNFT**: An ERC721 NFT contract that represents elite membership status.
- **MembershipManager**: The core contract that manages access control, token distribution, and NFT minting.

## Contracts

### [`AccessToken`](src/AccessToken.sol)

- ERC20 token named "AccessToken" (symbol: ACS).
- Only the contract owner can mint new tokens.
- Used to gate access to membership features.

### [`MembershipNFT`](src/MembershipNFT.sol)

- ERC721 NFT named "AccessNFT" (symbol: ANT).
- Each NFT represents a unique membership.
- Minting is managed by the MembershipManager contract.

### [`MembershipManager`](src/MembershipManager.sol)

- Manages the logic for token-gated access and NFT rewards.
- Users can claim AccessTokens (up to a maximum amount).
- Users who hold enough AccessTokens can claim a MembershipNFT.
- Tracks which users have claimed NFTs and their token balances.
- Allows the owner to set the minimum token threshold for NFT eligibility.

## Live Contract Addresses

- **AccessToken**: [0xf3691E38D1C5ADC5629d9E5D1B1C02D8A2C755ce](https://etherscan.io/address/0xf3691E38D1C5ADC5629d9E5D1B1C02D8A2C755ce)
- **MembershipNFT**: [0x912908ed44b8C0857d5657896e25645b8F68E9E1](https://etherscan.io/address/0x912908ed44b8C0857d5657896e25645b8F68E9E1)
- **MembershipManager**: [0xb43ecE3189430d976728e3E499cbdE53A808855E](https://etherscan.io/address/0xb43ecE3189430d976728e3E499cbdE53A808855E)

## Usage

### Installation

1. **Clone the repository** and install dependencies:

   ```sh
   git clone <git@github.com:Macnelson9/solidity-cohort-7.git>
   cd foundry
   forge install OpenZeppelin/openzeppelin-contracts
   forge install foundry-rs/forge-std
   ```

2. **Compile contracts**:
   ```sh
   forge build
   ```

### Deployment

Deploy all contracts using the provided script [`script/MembershipManager.s.sol`](script/MembershipManager.s.sol):

```sh
forge script script/MembershipManager.s.sol:deployAccessToken --private-key <YOUR_PRIVATE_KEY> --rpc-url https://eth-sepolia.g.alchemy.com/public --broadcast
```
