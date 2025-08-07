// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {MembershipManager} from "src/MembershipManager.sol";
import {AccessToken} from "src/AccessToken.sol";
import {MembershipNFT} from "src/MembershipNFT.sol";

contract TokenGateTest is Test {
    uint256 MINIMUM_BALANCE = 10;
    address meso = makeAddr("meso");
    MembershipManager public membershipManager;
    AccessToken public accessToken;
    MembershipNFT public membershipNFT;

    address account1 = address(0x345);
    address account2 = address(0x678);

    // Custom errors
    error AmountTooHigh();
    error InsufficientBalance();
    error UnauthorizedAccess();
    error UnauthorizedClaim();

    function setUp() public {
        accessToken = new AccessToken();
        membershipNFT = new MembershipNFT();

        membershipManager = new MembershipManager(address(accessToken), address(membershipNFT), address(membershipManager));
        accessToken.mint(address(membershipManager), 1000);
    } 

    function test_Deployment() public view {
        assertEq(accessToken.balanceOf(address(membershipManager)), 1000);
        assertEq(accessToken.name(), "AccessToken");
        assertEq(accessToken.symbol(), "ACS");
        assertEq(accessToken.getOwner(), address(this));
        assertEq(membershipNFT.name(), "AccessNFT");
        assertEq(membershipNFT.symbol(), "ANT");
    }

    function test_Revert_If_Unauthorized_Minter() public {
        vm.prank(account1);
        vm.expectRevert();
        accessToken.mint(account2, 1000);
    }

    function test_OnlyOwner_Can_Call_MinimumThreshold() public {
        vm.prank(account1);
        vm.expectRevert(UnauthorizedAccess.selector);
        membershipManager.setMinimumThreshold(200);
    }

    function test_Successfully_SetMinimumThreshold () public {
        vm.prank(address(membershipManager));
        assertEq(membershipManager.minAmount(), 0);
        membershipManager.setMinimumThreshold(100);
        assertEq(membershipManager.minAmount(), 100);
    }

    function test_Maximum_AccessToken_Amount() public {
        assertEq(accessToken.balanceOf(account1), 0);
        vm.startPrank(account1);
        vm.expectRevert(AmountTooHigh.selector);
        membershipManager.getAccessToken(100);
        vm.stopPrank();
    }

    function test_AccessToken_Transfer_Successfully () public {
        assertEq(accessToken.balanceOf(account1), 0);

        vm.startPrank(account1);
        membershipManager.getAccessToken(50);
        uint256 currentBalance = accessToken.balanceOf(account1);
        assertEq(currentBalance, 50);
        console.log(currentBalance);
        assertEq(membershipManager.balances(account1), 50);
        vm.stopPrank();
    }

    function test_Revert_If_CallerBalance_Is_Insufficient_To_MintNFT() public {
        vm.startPrank(account1);
        membershipManager.getAccessToken(30);
        uint256 currentBalance = accessToken.balanceOf(account1);
        assertEq(currentBalance, 30);
        assertEq(membershipManager.balances(account1), 30);

        vm.expectRevert(InsufficientBalance.selector);
        membershipManager.claimMembershipNFT();
        vm.stopPrank();
    }

    function test_If_Caller_Has_Claimed_NFT_Before() public {
        vm.startPrank(account1);
        membershipManager.getAccessToken(50);
        uint256 currentBalance = accessToken.balanceOf(account1);
        assertEq(currentBalance, 50);
        assertEq(membershipManager.balances(account1), 50);

        assertEq(membershipManager.hasClaimed(account1), false);
        membershipManager.claimMembershipNFT();

        vm.expectRevert(UnauthorizedClaim.selector);
        membershipManager.claimMembershipNFT();

        vm.stopPrank();
    }

    function test_If_User_Claimed_NFT_Successfully() public {
        vm.startPrank(account1);
        membershipManager.getAccessToken(50);
        uint256 currentBalance = accessToken.balanceOf(account1);
        assertEq(currentBalance, 50);
        assertEq(membershipManager.balances(account1), 50);

        assertEq(membershipManager.hasClaimed(account1), false);

        uint256 mintedTokenId = membershipManager.claimMembershipNFT();

        assertEq(mintedTokenId, 1); 
        assertEq(membershipNFT.ownerOf(mintedTokenId), account1); 
        vm.stopPrank();
    }
}