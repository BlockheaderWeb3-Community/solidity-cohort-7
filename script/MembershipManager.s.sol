// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import {Script} from "forge-std/Script.sol";
import {AccessToken} from "src/AccessToken.sol";
import {MembershipNFT} from "src/MembershipNFT.sol";
import {MembershipManager} from "src/MembershipManager.sol";

contract deployAccessToken is Script {
    function run() external returns(AccessToken, MembershipNFT, MembershipManager) {
        vm.startBroadcast();
        AccessToken accessToken = new AccessToken();
        MembershipNFT membershipNFT = new MembershipNFT();
        MembershipManager membershipManager = new MembershipManager(address(accessToken), address(membershipNFT), address(accessToken.getOwner()));
        vm.stopBroadcast();

        return (accessToken, membershipNFT, membershipManager);
    }
}