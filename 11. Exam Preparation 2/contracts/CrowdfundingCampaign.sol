// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdfundingCampaign is ERC20, Ownable {
    string public projectName;
    string public description;
    uint256 public fundingGoal;
    uint256 public endDate;

    uint256 public totalFunding;
    mapping (address => uint256) public contributions;

    uint256 public totalRewards;
    mapping(address => uint256) public rewardClaimed;

    event CampaignCreated(address creator, address indexed campaignAddress);
    event CampaignFunded(address funder, uint256 amount);
    event CampaignFundingReleased(address owner, uint256 amount);
    event CampaignFundingWithdrawn(address funder, uint256 amount);
    event CampaignRewardDistributed(address owner, uint256 amount);
    event CampaignRewardClaimed(address funder, uint256 amount);

    constructor(string memory _tokenName, string memory _tokenSymbol, string memory _projectName, string memory _description, uint256 _fundingGoal, uint256 _endDate) 
            ERC20(_tokenName, _tokenSymbol) {
        require(bytes(_tokenName).length > 0, "Token name is required");
        require(bytes(_tokenSymbol).length > 0, "Token symbol is required");
        require(bytes(_projectName).length > 0, "Project name is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_fundingGoal > 0, "Funding goal is required");
        require(_endDate > block.timestamp, "End date should be in the future");

        projectName = _projectName;
        description = _description;
        fundingGoal = _fundingGoal;
        endDate = _endDate;
    }

    function contribute(uint256 amount) public {
        require(block.timestamp < endDate, "Campaign has ended");
        require(totalFunding < fundingGoal, "Campaign has reached its funding goal");
        require(amount > 0, "Contribution amount should be greater than 0");

        uint256 remainingFunding = fundingGoal - totalFunding;
        uint256 contribution = amount > remainingFunding ? remainingFunding : amount;

        contributions[msg.sender] += contribution;
        totalFunding += contribution;

        _mint(msg.sender, contribution);

        emit CampaignFunded(msg.sender, contribution);
    }

    function releaseFunds() public onlyOwner {
        require(block.timestamp > endDate, "Campaign has not ended yet");
        require(totalFunding >= fundingGoal, "Campaign has not reached its funding goal");

        payable(owner()).transfer(address(this).balance);

        emit CampaignFundingReleased(owner(), address(this).balance);
    }

    function withdrawContribution() public {
        require(block.timestamp > endDate, "Campaign has not ended yet");
        require(totalFunding < fundingGoal, "Campaign has reached its funding goal");
        require(contributions[msg.sender] > 0, "You have not contributed to this campaign");

        uint256 contribution = contributions[msg.sender];
        contributions[msg.sender] = 0;
        totalFunding -= contribution;

        (bool success, ) = payable(msg.sender).call{value: contribution}("");
        require(success, "Failed to withdraw contribution");

        emit CampaignFundingWithdrawn(msg.sender, contribution);
    }

    function rewardDistribution() external payable onlyOwner {
        require(block.timestamp > endDate, "Campaign has not ended yet");
        require(totalFunding >= fundingGoal, "Campaign has not reached its funding goal");

        totalRewards += msg.value;     

        emit CampaignRewardDistributed(owner(), msg.value); 
    }

    function claimReward() public {
        require(block.timestamp > endDate, "Campaign has not ended yet");
        require(totalFunding >= fundingGoal, "Campaign has not reached its funding goal");
        require(totalRewards > 0, "No rewards to claim");
        require(contributions[msg.sender] > 0, "You have not contributed to this campaign");

        uint256 rewardShare = (contributions[msg.sender] / totalFunding) * 100;
        uint256 reward = (totalRewards * rewardShare) / 100;
        uint256 rewardForClaim = reward - rewardClaimed[msg.sender];        
       
        rewardClaimed[msg.sender] += rewardForClaim;
        totalRewards -= reward;

        (bool success, ) = payable(msg.sender).call{value: rewardForClaim}("");
        require(success, "Failed to claim reward");

        emit CampaignRewardClaimed(msg.sender, rewardForClaim);
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }  
}

