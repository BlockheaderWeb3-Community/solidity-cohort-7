// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import "contracts/BlockMarketPlace.sol";
import "contracts/BlockNft.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract MockOwner is IERC721Receiver {
    BlockMarketPlace public marketplace;
    BlockNft public nft;
    string public Name;

    constructor(BlockMarketPlace _marketplace, BlockNft _nft) {
        marketplace = _marketplace;
        nft = _nft;
    }

    function callList(Listing memory l) external {
        nft.mint(address(this));
        nft.setApprovalForAll(address(marketplace), true);
        marketplace.listNft(l);
    }

    function setname(string memory _name) external {
        Name = _name;
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        public
        override
        returns (bytes4)
    {
        return this.onERC721Received.selector;
    }

    fallback() external payable {
        revert("function not found");
    }

    receive() external payable {
        revert("native transfer are unsupported!!!");
    }
}
