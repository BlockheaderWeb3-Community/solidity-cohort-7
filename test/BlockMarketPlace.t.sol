// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "lib/forge-std/src/Test.sol";
import "contracts/BlockMarketPlace.sol";
import "contracts/BlockNft.sol";
import "contracts/BlockHeaderToken.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract BlockMarketPlaceTest is Test, IERC721Receiver {
    BlockMarketPlace public market;
    BlockNft public nft;
    BlockToken public erc20;
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        vm.startPrank(owner, owner);
        market = new BlockMarketPlace();
        nft = new BlockNft();
        erc20 = new BlockToken("BlockToken", "BKT", msg.sender);

        vm.label(address(market), "marketplace");
        vm.label(address(nft), "Nft token");
        vm.label(address(erc20), "payment token");

        deal(user1, 100 ether);
        deal(user2, 100 ether);

        // deal erc20 tokens
        deal(address(erc20), user1, 100 ether);
        deal(address(erc20), user2, 100 ether);

        // mint nft to user 1 as lister
        nft.mint(user1);
        nft.mint(address(this));
    }

    function test_list_nft_with_payment_token() public {
        Listing memory l;
        l.owner = user1;
        l.tokenId = 1;
        l.paymentToken = IERC20(erc20);
        l.price = 10e18;
        l.NftToken = address(nft);
        l.minOffer = 7e18;

        vm.startPrank(user1);
        nft.setApprovalForAll(address(market), true);
        market.listNft(l);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), address(market));
    }

    function _setlisting(
        bool _isNative,
        uint256 _minOffer,
        uint256 _price,
        address _paymentToken,
        address _owner,
        uint256 _tokenId
    ) internal {
        Listing memory l;
        l.owner = _owner;
        l.tokenId = _tokenId;
        l.paymentToken = IERC20(_paymentToken);
        l.price = _price;
        l.NftToken = address(nft);
        l.minOffer = _minOffer;
        l.isNative = _isNative;

        vm.startPrank(_owner);
        nft.setApprovalForAll(address(market), true);
        market.listNft(l);
        vm.stopPrank();
    }

    function test_list_nft_checks() public {
        // test price revert if 0
        Listing memory l;
        l.owner = user1;
        l.tokenId = 1;
        l.paymentToken = IERC20(erc20);
        l.price = 0;
        l.NftToken = address(nft);
        l.minOffer = 7e18;

        vm.startPrank(user1);
        nft.setApprovalForAll(address(market), true);

        vm.expectRevert("Invalid price");
        market.listNft(l);

        // test min offer revert if 0
        Listing memory ll;
        ll.owner = user1;
        ll.tokenId = 1;
        ll.paymentToken = IERC20(erc20);
        ll.price = 10;
        ll.NftToken = address(nft);
        ll.minOffer = 0;

        vm.startPrank(user1);
        nft.setApprovalForAll(address(market), true);

        vm.expectRevert("Invalid min offer");
        market.listNft(ll);

        // test payment address should be o if is Native
        Listing memory lll;
        lll.owner = user1;
        lll.tokenId = 1;
        lll.paymentToken = IERC20(erc20);
        lll.price = 10;
        lll.NftToken = address(nft);
        lll.minOffer = 7;
        lll.isNative = true;

        vm.startPrank(user1);
        nft.setApprovalForAll(address(market), true);

        vm.expectRevert("ERC20 Payment is not supported");
        market.listNft(lll);

        // test that the require statement within is native is successful
        Listing memory list;
        list.owner = user1;
        list.tokenId = 1;
        list.paymentToken = IERC20(address(0));
        list.price = 10;
        list.NftToken = address(nft);
        list.minOffer = 7;
        list.isNative = true;

        vm.startPrank(user1);
        nft.setApprovalForAll(address(market), true);
        market.listNft(list);
    }

    function test_buy_when_listing_is_not_native() public {
        test_list_nft_with_payment_token();
        vm.startPrank(user2);
        erc20.approve(address(market), type(uint256).max);
        market.buyNft(0);
    }

    function test_buy_when_is_Native() public {
        _setlisting(true, 7e18, 10e18, address(0), user1, 1);
        vm.startPrank(user2);
        market.buyNft{value: 10e18}(0);
    }

    function test_buy_checks() public {
        test_buy_when_is_Native();
        vm.expectRevert("ALready Sold");
        market.buyNft{value: 10e18}(0);
    }

    function test_buy_reverts_if_price_Invalid() public {
        _setlisting(true, 7e18, 10e18, address(0), user1, 1);
        vm.startPrank(user2);
        vm.expectRevert("Incorrect price");
        market.buyNft{value: 1e18}(0);
    }

    function test_buy_require_success_works() public {
        _setlisting(true, 7e18, 10e18, address(0), address(this), 2);
        vm.startPrank(user2);
        vm.expectRevert("Owner transfer failed");
        market.buyNft{value: 10e18}(0);

        vm.startPrank(address(this), address(this));
        market = new BlockMarketPlace();
        vm.stopPrank();

        _setlisting(true, 7e18, 10e18, address(0), user1, 1);

        vm.expectRevert("MarketOwner Transfer failed");
        market.buyNft{value: 10e18}(0);
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        public
        override
        returns (bytes4)
    {
        return this.onERC721Received.selector;
    }
}
