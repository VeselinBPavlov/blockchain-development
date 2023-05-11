// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract AuctionPlatform {

    struct Item {
        string name;
        string description;
        uint256 startingPrice;
    }

    struct Auction {
        address creator;
        uint256 startTime;
        uint256 endTime;
        bool isDone;
        uint256 highestBid;
        address highestBidder;
        Item item;
    }

    uint256 private currentId;
    mapping(uint256 => Auction) private auctions;
    mapping(address => uint256) private availableToWithdral;

    event AuctionCreated(address indexed creator);
    event NewHighestBid(address indexed bidder);

    modifier onlyActiveAuction(uint256 id) {
        require(auctions[id].endTime > block.timestamp, "Auction already expired.");
        _;
    }

    function createAuction(
        uint256 start,
        uint256 duration,
        string memory itemName,
        string memory itemDescription,
        uint256 startingPrice
    ) public {
        require(start > block.timestamp, "Auction need to start in the future.");
        require(duration > 0, "The duration of the auction need to be more than 0");
        
        currentId++;

        Item memory newItem = Item(itemName, itemDescription, startingPrice);
        
        auctions[currentId] = Auction(
            msg.sender,
            start,
            start + duration,
            false,
            0,
            address(0),
            newItem
        );

        emit AuctionCreated(msg.sender);
    }

    function placeBid(uint id) public payable onlyActiveAuction(id) {
        require(auctions[id].highestBid < msg.value, "The bid is not bigger than the highest bid.");

        if (auctions[id].highestBid > 0) {
            availableToWithdral[auctions[id].highestBidder] = auctions[id].highestBid;
        }

        auctions[id].highestBid = msg.value;
        auctions[id].highestBidder = msg.sender;
        payable(msg.sender).transfer(msg.value);       

        emit NewHighestBid(msg.sender);
    }

    function finalizeAuction(uint256 id) public payable  onlyActiveAuction(id) {
        require(auctions[id].isDone == false, "Auction is alredady done.");

        auctions[id].isDone = true;

        if (auctions[id].highestBid > 0) {
            payable(auctions[id].creator).transfer(auctions[id].highestBid);
        }
    }

    function withraw() public {
        require(availableToWithdral[msg.sender] > 0, "There is zero funds to withdraw for this user");

        payable(msg.sender).transfer(availableToWithdral[msg.sender]);
        availableToWithdral[msg.sender] = 0;
    }
}
