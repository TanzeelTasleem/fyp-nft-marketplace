// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./erc1155.sol";


contract Marketplace is ERC1155Holder,ERC721Holder {

  
    event Bid(uint256 tokenId, uint256 listingId, uint256 bidPrice, address bidder);
    event Sale(uint256 price, address to, address from, uint256 tokenId);
    event List(uint256 price, address from, uint256 listingId, uint256 tokenId);
    event Cancel(uint256 price, address from, uint256 listingId, uint256 tokenId);

    struct AuctionDetails {
        // Current owner of NFT
        address seller;
        // Price (in wei) at beginning of auction
        uint256 basePrice;
        // Duration (in seconds) of auction
        uint256 endingUnix;
        // Time when auction started
        uint256 startingUnix;
        // tokenId
        uint256 tokenId;
        //cancelled
        bool cancelled;
     
    }

    struct BasicSellingDetails {
        // Current owner of NFT
        address seller;
        // Price (in wei)
        uint256 price;
        // Time when nft listed
        uint256 listingUnix;
        // amount
        uint256 amount;
        // tokenId
        uint256 tokenId;
        //cancelled
        bool cancelled;
        //howManySol
        uint256 soldAmount;
     
    }


    struct BiddingDetails {
        uint256 highestBid;
        address highestBidder;
        uint256 totalBids;
        uint256 tokenId;
    }

    mapping  (uint256 => BasicSellingDetails) public basicSelling;

    mapping  (uint256 => AuctionDetails) public auctions;
    mapping  (uint256 => BiddingDetails) public bids;
    mapping  (address => uint256) public claimableAmount;


    address public nftContractAddress;
    uint256 public listingId;

    constructor(address _nftContractAddress)  {
        nftContractAddress = _nftContractAddress; 
    }
    

   function createAuction(uint256 _basePrice, uint256 _tokenId) public{
        uint256 totalSupply =  MyToken(nftContractAddress).totalSupply(_tokenId );
        require (totalSupply == 1, "This token cannot be auctioned");
        uint256 balance =  IERC1155(nftContractAddress).balanceOf(msg.sender, _tokenId );
        require (balance == 1, "You do not own this token");
        require (_basePrice > 0, "Base price cannot be set to 0");

        IERC1155(nftContractAddress).safeTransferFrom(msg.sender,address(this),_tokenId,1,"");

        auctions[listingId] = AuctionDetails(msg.sender,_basePrice,0, block.timestamp,_tokenId,false);

        emit List(_basePrice, msg.sender, listingId, _tokenId);

        listingId++;
    }



    function sellNft(uint256 _price, uint256 _tokenId, uint256 _amount) public{
        uint256 balance =  IERC1155(nftContractAddress).balanceOf(msg.sender, _tokenId);

        require (balance > 0, "You do not own this token");
        require (_price > 0, "Price cannot be set to 0");

        IERC1155(nftContractAddress).safeTransferFrom(msg.sender,address(this),_tokenId,_amount,"");

        basicSelling[listingId] = BasicSellingDetails(msg.sender,_price, block.timestamp, _amount,_tokenId,false,0);
        
        emit List(_price, msg.sender, listingId, _tokenId);

        listingId++;

    }


    
    function changeSellPrice(uint256 _listingId, uint256 _price) public{

        require (_price > 0, "Price cannot be set to 0");

        BasicSellingDetails memory sell = basicSelling[_listingId];

        require (sell.seller == msg.sender, "You do not own this listing");
        require (sell.cancelled == false, "This listing has been cancelled");
        uint256 balance =  IERC1155(nftContractAddress).balanceOf(address(this), sell.tokenId);

        require(balance > 0, "This token has already been sold");

        basicSelling[_listingId].price = _price;

        emit List(_price, msg.sender, _listingId, sell.tokenId);
        
    }



    function buyNft(uint256 _listingId, uint256 _amount) payable public{

        BasicSellingDetails memory sell = basicSelling[_listingId];

        require (sell.listingUnix > 0, "This token is not listed to be sold" );
        require (sell.cancelled == false, "This listing has been cancelled");
        require (sell.amount - sell.soldAmount >= _amount, "There are not these may copies available to buy");
        require (msg.value == (sell.price*_amount), "Listed price and the amount sent to the contract do not match" );

        string memory collectionId =  MyToken(nftContractAddress).nftCollectionRecord(sell.tokenId);

        address[] memory royaltyHolders = MyToken(nftContractAddress).getRoyaltyHolders(collectionId);

        uint256[] memory royaltyPercentages = MyToken(nftContractAddress).getRoyaltyPercentages(collectionId);

        basicSelling[_listingId].soldAmount += _amount;

        uint256 amountRemaining = msg.value;

        for (uint256 i =0; i<royaltyHolders.length; i++){
            uint256 royalty = (royaltyPercentages[i]*amountRemaining)/100;

            amountRemaining = amountRemaining - royalty;
            (bool s, ) = payable(royaltyHolders[i]).call{value: royalty}("");
            require(s);

        }

        (bool os, ) = payable(sell.seller).call{value: amountRemaining}("");
        require(os);

        IERC1155(nftContractAddress).safeTransferFrom(address(this),msg.sender,sell.tokenId,_amount,"");
        
        emit Sale(sell.amount, msg.sender, sell.seller, sell.tokenId);

    }




    function changeAuctionBasePrice(uint256 _listingId, uint256 _basePrice) payable public{
   
           require (_basePrice > 0, "Base price cannot be set to 0");

        AuctionDetails memory auction = auctions[_listingId];

        require (auction.seller == msg.sender , "You do not own this listing");
        require (auction.cancelled == false, "This listing has been cancelled");
        require (auction.endingUnix == 0 , "Base price for this auction cannot be changed");

        auctions[_listingId].basePrice = _basePrice;

        emit List(_basePrice, msg.sender, _listingId, auction.tokenId);
    }

    

    function cancelAuction(uint256 _listingId) payable public{
   
        AuctionDetails memory auction = auctions[_listingId];

        require (auction.seller == msg.sender , "You do not own this listing");
        require (auction.cancelled == false, "This auction has already been cancelled");
        require (auction.endingUnix == 0 , "This auction has already started and cannot be cancelled");

        auctions[_listingId].cancelled = true;

        IERC1155(nftContractAddress).safeTransferFrom(address(this),auction.seller,auction.tokenId,1,"");

        emit Cancel(auction.basePrice, msg.sender, _listingId, auction.tokenId);

    }

   function cancelSell(uint256 _listingId) payable public{
   
        BasicSellingDetails memory sell = basicSelling[_listingId];

        require (sell.seller == msg.sender, "You do not own this listing");
        require (sell.cancelled == false, "This listing has already been cancelled");
        uint256 balance =  IERC1155(nftContractAddress).balanceOf(address(this), sell.tokenId);
        require(balance > 0, "This token has already been sold");

        basicSelling[_listingId].cancelled = true;

       IERC1155(nftContractAddress).safeTransferFrom(address(this),sell.seller,sell.tokenId,(sell.amount - sell.soldAmount),"");

    }




   function bid(uint256 _listingId) payable public{
   
        AuctionDetails memory auction = auctions[_listingId];

        require (auction.startingUnix > 0 , "This token is not on auction");
        require (auction.cancelled == false, "This listing has been cancelled");
        require (auction.endingUnix >= block.timestamp || auction.endingUnix == 0 , "This auction has ended");

        if (auction.endingUnix == 0){
        auctions[_listingId].endingUnix = block.timestamp + 24 hours;
        }
        if (auction.endingUnix + 15 minutes >= block.timestamp){
        auctions[_listingId].endingUnix += 15 minutes;
        }

        BiddingDetails memory biddingInfo = bids[_listingId];

        if (biddingInfo.totalBids == 0){
        
        require (msg.value >= auction.basePrice, "Your bid should be greater than or equal to the base price");
        }

        else {
        require (msg.value > biddingInfo.highestBid, "Your bid should be greater than the previous bid" );
        }

        claimableAmount[biddingInfo.highestBidder] = biddingInfo.highestBid;

        biddingInfo.totalBids++;
        biddingInfo.highestBidder = msg.sender;
        biddingInfo.highestBid = msg.value;
        biddingInfo.tokenId = auction.tokenId;

        bids[_listingId] = biddingInfo;

        emit Bid(auction.tokenId, _listingId, msg.value, msg.sender);
   
    }


    function concludeAuction(uint256 _listingId) public{
        
        BiddingDetails memory biddingInfo = bids[_listingId];
        AuctionDetails memory auction = auctions[_listingId];

        require(msg.sender == auction.seller || msg.sender == biddingInfo.highestBidder, "You are not authorized to perform this action");

        require (auction.startingUnix > 0 , "This token is not on auction");
        require (auction.cancelled == false, "This listing has been cancelled");
        require (auction.endingUnix < block.timestamp && auction.endingUnix != 0 , "This auction is still in progress");

        if (biddingInfo.highestBid == 0  && auction.endingUnix <= block.timestamp){
            IERC1155(nftContractAddress).safeTransferFrom(address(this),auction.seller,auction.tokenId,1,"");
        }

        else {


            string memory collectionId =  MyToken(nftContractAddress).nftCollectionRecord(auction.tokenId);

            address[] memory royaltyHolders = MyToken(nftContractAddress).getRoyaltyHolders(collectionId);

            uint256[] memory royaltyPercentages = MyToken(nftContractAddress).getRoyaltyPercentages(collectionId);

            uint256 amountRemaining = biddingInfo.highestBid;


            for (uint256 i =0; i<royaltyHolders.length; i++){
                uint256 royalty = (royaltyPercentages[i]*amountRemaining)/100;

                amountRemaining = amountRemaining - royalty;
                (bool s, ) = payable(royaltyHolders[i]).call{value: royalty}("");
                require(s);

            }

            (bool os, ) = payable(auction.seller).call{value: amountRemaining}("");
            require(os);

            IERC1155(nftContractAddress).safeTransferFrom(address(this),biddingInfo.highestBidder,auction.tokenId,1,"");

            emit Sale(amountRemaining, biddingInfo.highestBidder, auction.seller, auction.tokenId);
        }

    }



    function claimBalance() public{
        
        uint256 amount = claimableAmount[msg.sender];

        require(amount > 0, "You do not have any amount to be claimed");

        delete claimableAmount[msg.sender];

        (bool os, ) = payable(msg.sender).call{value: amount}("");
        require(os);


    }

}