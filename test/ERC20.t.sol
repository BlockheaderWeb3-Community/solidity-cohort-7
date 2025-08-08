// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// import {Test} from "forge-std/Test.sol";
// // import {Vm} from "forge-std/Vm.sol";
// import {console} from "forge-std/console.sol";
// import {ERC20} from "../src/ERC20.sol";

// contract ERC20Test is Test {
//     ERC20 public erc20;

//     string tokenName = "IBS Token";
//     string tokenSymbol = "IBST";
//     uint8 tokenDecimals = 6;
// //   function getOwner() external view returns(address) {
//     //     return owner;
//     // }  address adminAddress = address(0x123);
//     address account1 = address(0x567);
//     address account2 = address(0x678);
//     address zeroAddress = address(0);

//     struct X {
//         uint256 x;
//         uint256 y;
//     }
//     error InsufficientFundsError();
//     event Transfer(address indexed from, address indexed to, uint256 value);
//     event DummyEvent(X indexed structA, X structB);

//     function setUp() public {
//         erc20 = new ERC20(tokenName, tokenSymbol, tokenDecimals, adminAddress);
//         // Get address of deployed contract (erc20)
//         console.log(address(erc20));
//         vm.prank(adminAddress);
//         erc20.mint(adminAddress, 1000 ** tokenDecimals);
//     }

//     function test_Deployment() public view {
//         assertEq(erc20.name(), tokenName);
//         assertEq(erc20.symbol(), tokenSymbol);
//         assertEq(erc20.decimals(), tokenDecimals);
//         assertEq(erc20.adminAddress(), adminAddress);
//         assertEq(erc20.balanceOf(adminAddress), 1000 ** tokenDecimals);
//     }

//     function test_TransferRevertedWhen_SenderHasInsufficientFunds() public {
//         assertEq(erc20.balanceOf(account1), 0);
//         vm.startPrank(account1);
//         // vm.expectRevert("Insufficient fund");
//         vm.expectRevert(InsufficientFundsError.selector);
//         erc20.transfer(account2, 50 ** tokenDecimals);
//         vm.stopPrank();
//     }

//     function test_TransferRevertedWhen_CallerIsZeroAddress() public {
//         vm.prank(zeroAddress);
//         vm.expectRevert("Invalid caller");
//         erc20.transfer(account1, 1 ** tokenDecimals);
//     }

//     function test_Transfer_BalanceChanged() public {
//         uint256 initialAdminBalance = erc20.balanceOf(adminAddress);
//         uint256 initialRecipientBalance = erc20.balanceOf(account1);
//         uint256 transferAmount = 5 ** tokenDecimals;

//         assertEq(initialAdminBalance, 1000 ** tokenDecimals);
//         assertEq(initialRecipientBalance, 0);

//         vm.startPrank(adminAddress);
//         erc20.transfer(account1, transferAmount);
//         vm.stopPrank();

//         uint256 currentAdminBalance = erc20.balanceOf(adminAddress);
//         uint256 currentRecipientBalance = erc20.balanceOf(account1);

//         assertEq(currentAdminBalance, initialAdminBalance - transferAmount);
//         assertEq(
//             currentRecipientBalance,
//             initialRecipientBalance + transferAmount
//         );
//     }

//     function test_Transfer_emitTransferEvent() public {
//         uint256 transferAmount = 5 ** tokenDecimals;
//         vm.prank(adminAddress);
//         vm.expectEmit(true, true, false, true);
//         emit Transfer(adminAddress, account1, transferAmount);
//         erc20.transfer(account1, transferAmount);
//     }

//     // Experimental
//     function test_EmitDummyEvent() public {
//         X memory x;
//         X memory y;

//         x.x = 1;
//         x.y = 2;

//         y.x = 11;
//         y.y = 22;

//         vm.expectEmit(true, false, false, true);
//         emit DummyEvent(x, x);
//         erc20.emitDummyEvent();
//         console.log(address(this));
//     }
// }
