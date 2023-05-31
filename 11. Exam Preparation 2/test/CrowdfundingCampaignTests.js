const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingCampaign", function () {
  async function deployPlatform() {
    const [deployer, firstOwner] = await ethers.getSigners();

    const CrowdfundingPlatformFactory = await ethers.getContractFactory("CrowdfundingPlatform", deployer);
    const crowdfundingPlatform = await CrowdfundingPlatformFactory.deploy();
    const _firstCampaign = crowdfundingPlatform.connect(firstOwner);
    const fundingGoal = ethers.utils.parseEther("200");
    const tx = await _firstCampaign.createCampaign("First Campaign", "First description", fundingGoal, 1686836514);
    console.log(tx);
    return { crowdfundingPlatform, deployer, firstOwner };
  }

  describe("RewardDestribution", function () {
    it("Should require project name", async function () {
      const { crowdfundingPlatform, deployer, firstOwner } = await loadFixture(deployPlatform);
      const _firstCampaign = crowdfundingPlatform.connect(firstOwner);
      const fundingGoal = ethers.utils.parseEther("200");
      const tx = await _firstCampaign.createCampaign("", "First description", fundingGoal, 1686836514);
      await expect(tx).to.be.revertedWith("Project name is required");
    });    
  });  
});
