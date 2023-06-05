// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";

contract CharityPlatform {
    using Counters for Counters.Counter;

    Counters.Counter private _campaignId;  

    struct Campaign {
        uint256 id;
        string name;
        string description;
        uint256 goal;
        uint256 endDate;        
        uint256 totalDonations;
        address creator;
        mapping(address => uint256) donations;
    }

    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 id);
    event DonationMade(uint256 id, uint256 donation);
    event FundsReleased(uint256 id, uint256 totalDonations);
    event RefundMade(uint256 id, uint256 donation);

    function createCampaign (
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _endDate
    ) external {
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_goal > 0, "Goal is required");
        require(_endDate > 0, "End date is required");
        require(_endDate > block.timestamp, "End date must be in the future");

        _campaignId.increment();
        uint256 newCampaignId = _campaignId.current();
        address _creator = msg.sender;

        Campaign storage newCampaign = campaigns[newCampaignId];

        newCampaign.id = newCampaignId;
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.goal = _goal;
        newCampaign.endDate = _endDate;
        newCampaign.creator = _creator;
        newCampaign.totalDonations = 0;

        emit CampaignCreated(newCampaignId);
    }

    function donate(uint256 campaignId) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(campaigns[campaignId].endDate > block.timestamp, "Campaign has ended");
        require(campaigns[campaignId].totalDonations < campaigns[campaignId].goal, "Campaign has reached its goal");

        emit DonationMade(campaigns[campaignId].id, msg.value);

        campaigns[campaignId].donations[msg.sender] += msg.value;
        campaigns[campaignId].totalDonations += msg.value;
    }

    function collectFunds(uint256 campaignId) external payable {
        require(
            campaigns[campaignId].totalDonations >= campaigns[campaignId].goal || campaigns[campaignId].endDate < block.timestamp,
            "Campaign has not reached its goal or ended yet"
        );
        require(campaigns[campaignId].creator == msg.sender, "Only the creator can release funds");

        emit FundsReleased(campaignId, campaigns[campaignId].totalDonations);

        (bool success, ) = payable(msg.sender).call{value: campaigns[campaignId].totalDonations}("");
        require(success, "Failed to send funds");
    }

    function refund(uint256 campaignId) external payable {
        require(
            campaigns[campaignId].totalDonations < campaigns[campaignId].goal && campaigns[campaignId].endDate < block.timestamp,
            "Campaign has reached its goal"
        );
        require(campaigns[campaignId].creator != msg.sender, "Creator cannot refund funds");
        require(campaigns[campaignId].donations[msg.sender] > 0, "Donator has not donated");

        emit RefundMade(campaignId, campaigns[campaignId].donations[msg.sender]);

        (bool success, ) = payable(msg.sender).call{value: campaigns[campaignId].donations[msg.sender]}("");
        require(success, "Failed to send funds");
    }
}
