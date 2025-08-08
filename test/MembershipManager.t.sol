// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import {Test, console} from "forge-std/Test.sol";
import {MembershipManager} from "../src/MembershipManager.sol";
import {AccessToken} from "../src/AccessToken.sol";
import {MembershipNFT} from "../src/MembershipNFT.sol";

contract MemberShipManagerTest is Test {
    MembershipManager public membershipManager;
    AccessToken public accessToken;
    MembershipNFT public membershipNFT;

    address account1 = address(0x345);
    address account2 = address(0x678);

    function setUp() public {
        accessToken = new AccessToken();
        membershipNFT = new MembershipNFT();

        membershipManager = new MembershipManager(address(accessToken), address(membershipNFT), accessToken.getOwner());
        accessToken.mint(address(membershipManager), 1000);
    } 

    function test_Deployment() public view {
        assertEq(accessToken.balanceOf(address(membershipManager)), 1000);
        assertEq(accessToken.name(), "Access Token");
        assertEq(accessToken.symbol(), "ACT");
        assertEq(accessToken.getOwner(), address(this));
        assertEq(membershipNFT.name(), "Membership NFT");
        assertEq(membershipNFT.symbol(), "MNFT");
    }

    function test_Revert_If_Unauthorized_Minter() public {
        vm.prank(account1);
        vm.expectRevert();
        accessToken.mint(account2, 1000);
    }

    function test_OnlyOwner_Can_Call_MinimumThreshold() public {
        vm.prank(account1);
        vm.expectRevert("MembershipManager:: Unauthorized User");
        membershipManager.setMinThreshold(200);
    }

    function test_Successfully_SetMinimumThreshold () public {
        vm.prank(membershipManager.getOwner());
        assertEq(membershipManager.minThreshold(), 0);
        membershipManager.setMinThreshold(100);
        assertEq(membershipManager.minThreshold(), 100);
    }

    function test_Revert_Call_From_Unauthorised_User_To_Change_MinThreshld() public {
        vm.startPrank(account1);
        vm.expectRevert("Unauthorized to call access token");
        membershipManager.giveAccessToken(account2,100);
        vm.stopPrank();
    }

    function test_AccessToken_Transfer_Successfully () public {
        uint256 initialBalance = accessToken.balanceOf(account1);
        uint256 transferAmount = 200;
        vm.startPrank(accessToken.getOwner());
        membershipManager.giveAccessToken(account2, transferAmount);
        uint256 currentBalance = accessToken.balanceOf(account2);
        assertEq(currentBalance, initialBalance + transferAmount);
        vm.stopPrank();
    }

    function test_Revert_If_Caller_Has_Claimed_NFT() public {
        test_AccessToken_Transfer_Successfully();
        vm.startPrank(account2);

        assertEq(membershipManager.hasClaimed(account2), false);
        membershipManager.claimMembershipNFT();

        vm.expectRevert("Claimed NFT already");
        membershipManager.claimMembershipNFT();

        vm.stopPrank();
    }

    function test_Revert_If_Caller_Access_Token_Doesnt_Reach_Min_Threshold() public {
        test_AccessToken_Transfer_Successfully();

        vm.startPrank(membershipManager.getOwner());
        membershipManager.setMinThreshold(500);
        vm.stopPrank();

        vm.startPrank(account2);

        assertEq(membershipManager.hasClaimed(account2), false);
        vm.expectRevert("You dont have access to mint");
        membershipManager.claimMembershipNFT();

        vm.stopPrank();
    }

    function test_If_User_Claimed_NFT_Successfully() public {
        test_AccessToken_Transfer_Successfully();
        
        vm.startPrank(account2);

        uint256 mintedTokenId = membershipManager.claimMembershipNFT();

        assertEq(mintedTokenId, 1); 
        assertEq(membershipNFT.ownerOf(mintedTokenId), account2); 
        vm.stopPrank();
    }
}