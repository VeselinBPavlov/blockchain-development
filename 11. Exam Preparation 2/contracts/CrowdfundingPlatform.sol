// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./CrowdfundingCampaign.sol";

contract CrowdfundingPlatform {
    address[] public campaigns;

    event CampaignCreated(address creator, address indexed campaignAddress);

    function createCampaign()  external {
        string memory _projectName;
        string memory _description;
        uint256 _fundingGoal;
        uint256 _endDate;

        require(bytes(_projectName).length > 0, "Project name is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_fundingGoal > 0, "Funding goal is required");
        require(_endDate > block.timestamp, "End date should be in the future");
        
        address newCampaign = address(new CrowdfundingCampaign(_projectName, _description, _fundingGoal, _endDate));

        campaigns.push(newCampaign);
        emit CampaignCreated(msg.sender, newCampaign);
    }
}
