// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Event is ERC721("MyToken", "MTK"), ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    string constant _METADATA = "https://api.jsonbin.io/v3/b/6459ebf3b89b1e22999a05f0?meta=false";

    Counters.Counter private _tokenIdCounter;

    uint256 public saleStart;
    uint256 public saleEnd;
    uint256 public ticketsPrice;
    uint256 public maxTickets;
    string public metadata;    
    address public randomWinner;

    constructor(
        uint256 _saleStart,
        uint256 _saleEnd,
        uint256 _ticketsPrice,
        uint256 _maxTickets,
        string memory _metadata,
        address owner
    ) {
        require(_ticketsPrice > 0, "Invalid price");
        require(_saleEnd > _saleStart, "Invalid data");
        saleStart = _saleStart;
        saleEnd = _saleEnd;
        ticketsPrice = _ticketsPrice;
        maxTickets = _maxTickets;
        metadata = _metadata;

        _transferOwnership(owner);
    }

    function buyTicket(uint256 amount) external payable  {
        require(amount < 50, "Too big amount.");
        require(amount * ticketsPrice == msg.value, "Insufficient value");

        if (maxTickets > 0) {
            require(_tokenIdCounter.current() + amount <= maxTickets, "Too many NFTs");
        }

        for(uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, _METADATA);
        }        
    }

    function withdraw() external onlyOwner {
        require(block.timestamp > saleEnd, "Too early");
        _chooseRandomWinner();
        payable (owner()).transfer(address(this).balance);
    }

    function _chooseRandomWinner() internal {
        require(randomWinner == address(0), "Already chosen");
        randomWinner = _ownerOf(block.prevrandao % _tokenIdCounter.current() - 1);

        _safeMint(randomWinner, _METADATA);
    }

    function _safeMint(address to, string memory uri) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }


}
