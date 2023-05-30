// SPDX-License-Identifier: UNLIXENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./NFT.sol";

contract NFTMarketplace is NFT {

    struct Sale {
        address seller;
        uint256 price;
    }

    event NFTListed(address indexed collection, uint256 indexed id, uint256 price);

    // collection => id => price
    mapping(address => mapping(uint256 => Sale)) public nftSales;
    // user => profit
    mapping(address => uint256) public profits;

    function listNFTForSale(address collection, uint256 id, uint256 price) external {   
        require(price != 0, "Price must be greater than 0");
        require(nftSales[collection][id].price == 0, "NFT is already for sale");

        nftSales[collection][id].price = price;

        emit NFTListed(collection, id, price);

        IERC721(collection).transferFrom(msg.sender, address(this), id);
    }
    
    function unlistNFT(address collection, uint256 id, address to) external {
        Sale memory sale = nftSales[collection][id];
        require(sale.price != 0, "NFT is not listed for sale");
        require(sale.seller == msg.sender, "Only seller can unlist NFT");

        delete nftSales[collection][id];

        IERC721(msg.sender).safeTransferFrom(address(this), to, id);
    }

    function purchaseNFT(address collection, uint256 id, address to) external payable {
        Sale memory sale = nftSales[collection][id];
        require(sale.price != 0, "NFT is not listed for sale");
        require(msg.value == sale.price, "Incorrect price");

        delete nftSales[collection][id];

        profits[sale.seller] += msg.value;

        IERC721(collection).safeTransferFrom(address(this), to, id);
    }

    function claimProfit() external {
        uint256 profit = profits[msg.sender];
        require(profit != 0, "No profit to claim");
        profits[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: profit}("");
        require(success, "Address: unable to send valuue, recipient may have reverted");
    }
}
