# **Assignment 1**

## Token-Gated Membership System

---

### **Objective**

Build a decentralized membership system where users gain access to exclusive features by holding a minimum amount of ERC20 tokens and are awarded ERC721 membership NFTs for elite participation.

### **Requirements**

1. **ERC20 Access Token Contract**

   * Create a custom ERC20 token (`AccessToken`) used to determine membership eligibility.
   * Tokens can be minted by the owner to distribute or sold in an ICO-like setup.

2. **ERC721 Membership NFT Contract**

   * Create an ERC721 contract (`MembershipNFT`) representing unique elite member badges.
   * Mint NFT to users who hold at least a defined amount of `AccessToken`.
   * Ensure each address can only receive **one** membership NFT.

3. **Membership Manager Smart Contract**

   * Verify ERC20 token holdings of users attempting to mint a membership NFT.
   * Allow only eligible users to claim a `MembershipNFT`.
   * Admin can adjust the minimum token threshold.

4. **Deployment & Interaction**

   * Deploy contracts to a Sepolia and add the addresses of various contracts in your submission

## How to submit

* Open a pull request that adds a folder to `/submissions/assignment1/`
* The name of the folder should be your Github username
* The folder should contain all your work, such as your Solidity smart contracts, as well as other files that support your submission such as README.

## ETD (Expected Time of Delivery)

***28/07/2025***