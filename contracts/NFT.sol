// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract BlockMarketPlace {
//     uint256 public listCounter;
//     uint256 public constant COMMISSION_PERCENT = 3;
//     address public immutable feeReceiver;

//     struct Listing {
//         address owner;
//         uint256 id;
//         address nftToken;
//         uint256 tokenId;
//         IERC20 paymentToken;
//         bool isNative;
//         uint256 price;
//         bool sold;
//         uint256 minOffer;
//     }

//     struct OfferDetails {
//         uint256 offerAmount;
//         address offerer;
//     }

//     mapping(uint256 => Listing) public idToListing;
//     mapping(uint256 => OfferDetails[]) public listingOffers;

//     constructor(address _feeReceiver) {
//         feeReceiver = _feeReceiver;
//     }

//     function listNft(
//         address nftToken,
//         uint256 tokenId,
//         address paymentToken,
//         bool isNative,
//         uint256 price,
//         uint256 minOffer
//     ) external {
//         require(price > 0, "Price must be greater than 0");

//         IERC721(nftToken).safeTransferFrom(msg.sender, address(this), tokenId);

//         idToListing[listCounter] = Listing({
//             owner: msg.sender,
//             id: listCounter,
//             nftToken: nftToken,
//             tokenId: tokenId,
//             paymentToken: IERC20(paymentToken),
//             isNative: isNative,
//             price: price,
//             sold: false,
//             minOffer: minOffer
//         });

//         listCounter++;
//     }

//     function buyNft(uint256 listId) external payable {
//         Listing storage listing = idToListing[listId];
//         require(!listing.sold, "Already sold");

//         uint256 commission = (listing.price * COMMISSION_PERCENT) / 100;
//         uint256 sellerAmount = listing.price - commission;

//         if (listing.isNative) {
//             require(msg.value == listing.price, "Incorrect native amount");
//             payable(listing.owner).transfer(sellerAmount);
//             payable(feeReceiver).transfer(commission);
//         } else {
//             IERC20 token = listing.paymentToken;
//             require(token.transferFrom(msg.sender, address(this), listing.price), "Payment failed");
//             require(token.transfer(listing.owner, sellerAmount), "Payout failed");
//             require(token.transfer(feeReceiver, commission), "Commission failed");
//         }

//         listing.sold = true;
//         IERC721(listing.nftToken).safeTransferFrom(address(this), msg.sender, listing.tokenId);
//     }

//     function makeOffer(uint256 listId, uint256 offerAmount) external payable {
//         Listing storage listing = idToListing[listId];
//         require(!listing.sold, "Already sold");
//         require(offerAmount >= listing.minOffer, "Offer too low");

//         if (listing.isNative) {
//             require(msg.value == offerAmount, "Incorrect ETH");
//         } else {
//             require(listing.paymentToken.transferFrom(msg.sender, address(this), offerAmount), "Transfer failed");
//         }

//         listingOffers[listId].push(OfferDetails({
//             offerAmount: offerAmount,
//             offerer: msg.sender
//         }));
//     }

//     function acceptOffer(uint256 listId, uint256 offerIndex) external {
//         Listing storage listing = idToListing[listId];
//         require(msg.sender == listing.owner, "Only owner");
//         require(!listing.sold, "Already sold");

//         OfferDetails memory offer = listingOffers[listId][offerIndex];
//         uint256 commission = (offer.offerAmount * COMMISSION_PERCENT) / 100;
//         uint256 payout = offer.offerAmount - commission;

//         if (listing.isNative) {
//             payable(listing.owner).transfer(payout);
//             payable(feeReceiver).transfer(commission);
//         } else {
//             listing.paymentToken.transfer(listing.owner, payout);
//             listing.paymentToken.transfer(feeReceiver, commission);
//         }

//         listing.sold = true;
//         IERC721(listing.nftToken).safeTransferFrom(address(this), offer.offerer, listing.tokenId);
//         delete listingOffers[listId]; // Clear offers
//     }
// }

