// // SPDX-License-Identifier: SEE LICENSE IN LICENSE
// pragma solidity 0.8.28;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// struct Listing{
//     address owner;
//     uint256 tokenId;
//     IERC20 paymentToken;
//     address NftToken;
//     bool isNative;
//     uint256 price;
//     bool sold;
//     uint minOffer;
// }

// struct OfferDetails{
//     uint256 listId;
//     uint256 offerAmount;
//     address offerrer;
//     address paymentToken;
//     bool status;
// }

// contract BlockMarketPlace {

// mapping (uint256 listid => Listing list) public idToListing;
// mapping (uint256 offerid => OfferDetails offer) public idToOffer;
// uint256 lastUpdatedid;
// address marketOwner;
//     function listNft(Listing memory list) external {
//        uint listId =  lastUpdatedid++;
//        require(list.price > 0, "Invalid price");
//        require(list.minOffer > 0, "Invalid min offer");
//        if(list.isNative){
//         require(address(list.paymentToken) == address(0));
//        }
//         Listing memory listing;
//         listing.owner = msg.sender;
//         listing.tokenId = list.tokenId;
//         listing.paymentToken = list.paymentToken;
//         listing.price = list.price;
//         listing.isNative = list.isNative;
//         listing.minOffer = list.minOffer;
//         listing.NftToken = list.NftToken;
//         idToListing[listId] = listing; 


//         IERC721(list.NftToken).transferFrom(msg.sender, address(this), list.tokenId);
//     }

//     function buyNft(uint256 listId) external payable {
//         Listing memory l = idToListing[listId];
//         require(!l.sold, "ALready Sold");
//         idToListing[listId].sold = true;
//         if(l.isNative){
//             require(msg.value == l.price, "Incorrect price");
//             (bool s,) = l.owner.call{value: l.price * 97/100}("");
//             (bool ss,) = marketOwner.call{value: l.price * 3/100}("");
//             require(s, "Owner transfer failed");
//             require(ss, "MarketOwner Transfer failed");
//         }else{
//             l.paymentToken.transferFrom(msg.sender, l.owner, l.price * 97/100);
//             l.paymentToken.transferFrom(msg.sender, marketOwner, l.price * 3/100);
//         }
//         IERC721(l.NftToken).transferFrom(address(this), msg.sender, l.tokenId);
//     }

//     function offer(uint256 listid, address paymentToken, uint256 amount) external payable {
//     Listing storage l = idToListing[listid];
//     require(!l.sold, "Already sold");
//     require(msg.sender != l.owner, "Owner cannot offer");

//     uint256 offerAmount;
//     if (l.isNative) {
//         offerAmount = msg.value;
//         require(offerAmount >= l.minOffer, "Offer too low");
//     } else {
//         require(paymentToken != address(0), "Invalid token");
//         require(amount >= l.minOffer, "Offer too low");
//         require(IERC20(paymentToken).transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
//         offerAmount = amount;
//     }

//     uint256 offerid = ++lastUpdatedid;
//     idToOffer[offerid] = OfferDetails({
//         listId: listid,
//         offerAmount: offerAmount,
//         offerrer: msg.sender,
//         paymentToken: paymentToken
//     });
// }

//     function acceptOffer(uint256 offerid) external {
//     OfferDetails memory offer = idToOffer[offerid];
//     Listing storage l = idToListing[offer.listId];
//     require(msg.sender == l.owner, "Only owner can accept offer");
//     require(!l.sold, "Already sold");

//     l.sold = true;
//     if (l.isNative) {
//         (bool success,) = l.owner.call{value: offer.offerAmount}("");
//         require(success, "Transfer to owner failed");
//     } else {
//         require(IERC20(offer.paymentToken).transfer(l.owner, offer.offerAmount), "Transfer to owner failed");
//     }
//     IERC721(l.NftToken).transferFrom(address(this), offer.offerrer, l.tokenId);
//     delete idToOffer[offerid];
// }

// function cancelOffer(uint256 offerid) external {
//         OfferDetails storage offer = idToOffer[offerid];
//         require(offer.offerrer == msg.sender, "Not offerer");
//         Listing memory l = idToListing[offer.listId];
//     if (l.isNative) {
//         (bool s,) = msg.sender.call{value: offer.offerAmount}("");
//         require(s, "Refund failed");
//     } else {
//         IERC20(offer.paymentToken).transfer(msg.sender, offer.offerAmount);
//     }
//     delete idToOffer[offerid];
// }

//     function cancelListing(uint256 listid) external {
//         Listing storage l = idToListing[listid];
//         require(msg.sender == l.owner, "Not owner");
//         require(!l.sold, "Already sold");
//         delete idToListing[listid];
//         IERC721(l.NftToken).transferFrom(address(this), msg.sender, l.tokenId);
//     }  
// }