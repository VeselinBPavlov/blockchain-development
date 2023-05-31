// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./CrowdfundingCampaign.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CrowdfundingPlatform {
    Counters.Counter private _campaignIds;  
    mapping(uint256 => CrowdfundingCampaign) public campaigns;

    event CampaignCreated(address creator, address indexed campaignAddress);

    function createCampaign()  external {
        string memory _tokenName;
        string memory _tokenSymbol;
        string memory _projectName;
        string memory _description;
        uint256 _fundingGoal;
        uint256 _endDate;

        CrowdfundingCampaign newCampaign = new CrowdfundingCampaign(_tokenName, _tokenSymbol, _projectName, _description, _fundingGoal, _endDate);
        _campaignIds.increment();
        campaigns[_campaignIds].push(newCampaign);
        emit CampaignCreated(msg.sender, newCampaign);
    }

    function getCampaigns() public view returns (mapping(uint256 => CrowdfundingCampaign) memory) {
        return campaigns;
    }
}
