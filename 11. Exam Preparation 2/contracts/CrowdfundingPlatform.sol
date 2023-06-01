// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./CrowdfundingCampaign.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CrowdfundingPlatform {
    using Counters for Counters.Counter;
    Counters.Counter private _campaignId;  
    mapping(uint256 => CrowdfundingCampaign) public campaigns;

    event CampaignCreated(address creator, address indexed campaignAddress);

    function createCampaign(
        string memory tokenName,
        string memory tokenSymbol,
        string memory projectName,
        string memory description,
        uint256 fundingGoal,
        uint256 endDate)
        external {
        CrowdfundingCampaign newCampaign = new CrowdfundingCampaign(tokenName, tokenSymbol, projectName, description, fundingGoal, endDate);
        _campaignId.increment();
        uint256 campaignId = _campaignId.current();
        campaigns[campaignId] = newCampaign;
        emit CampaignCreated(msg.sender, address(newCampaign));
    }

    function getCampaigns() public view returns (CrowdfundingCampaign[] memory) {
        CrowdfundingCampaign[] memory _campaigns = new CrowdfundingCampaign[](_campaignId.current());
        for (uint256 i = 0; i < _campaignId.current(); i++) {
            _campaigns[i] = campaigns[i];
        }
        return _campaigns;
    }
}
