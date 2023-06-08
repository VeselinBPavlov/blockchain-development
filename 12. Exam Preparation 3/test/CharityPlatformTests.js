const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityPlatform", function () {
  let owner, user, platform;
  let campaignId;

  before(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy the CharityPlatform contract
    const CharityPlatform = await ethers.getContractFactory("CharityPlatform");
    platform = await CharityPlatform.deploy();
    await platform.deployed();

    // Create a campaign
    await platform.createCampaign("Test Campaign", "Test Description", ethers.utils.parseEther("2"), Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30); // End date set to 30 days in the future
    campaignId = 1; // Assuming the campaign ID is 1 (based on your previous test code)
  });

  describe("donate", function () {
    it("Should allow a user to donate to a campaign", async function () {
      const donationAmount = ethers.utils.parseEther("1");

      // User donates to the campaign
      await platform.connect(user).donate(campaignId, { value: donationAmount });

      // Check that the donation was successful
      await expect(platform.connect(user).donate(campaignId, { value: donationAmount }))
          .to.emit(platform, "DonationMade")
          .withArgs(campaignId, donationAmount);
    });

    it("Should revert when the donation amount is 0", async function () {
      const donationAmount = ethers.utils.parseEther("0");

      // Attempt to donate 0 amount
      await expect(platform.connect(user).donate(campaignId, { value: donationAmount })).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should revert when the campaign has ended", async function () {
      const donationAmount = ethers.utils.parseEther("1");

      // Increase time to make the campaign end
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // Increase time by 31 days

      // Attempt to donate to an ended campaign
      await expect(platform.connect(user).donate(campaignId, { value: donationAmount })).to.be.revertedWith("Campaign has ended");
    });

    it("Should revert when the campaign has reached its goal", async function () {
      // Create a new campaign
      const endDate = 1719718614; // Set the end date to a future timestamp
      await platform.createCampaign("New Campaign", "New Description", ethers.utils.parseEther("5"), endDate);
    
      const newCampaignId = 2; // Assuming the new campaign ID is 2
      const donationAmount = ethers.utils.parseEther("5"); // Adjust the donation amount as desired
    
      // Donate to the new campaign to reach the goal
      await platform.connect(user).donate(newCampaignId, { value: donationAmount });
    
      // Attempt to donate to the campaign that has reached its goal
      await expect(platform.connect(user).donate(newCampaignId, { value: donationAmount })).to.be.revertedWith("Campaign has reached its goal");
    });
  });  

  describe("collectFunds", function () {
    it("Should allow the owner to collect funds from a campaign", async function () {
      // Increase time to make the campaign end
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // Increase time by 31 days

      // Collect funds from the campaign
      await platform.connect(owner).collectFunds(campaignId);

      // Check that the funds were collected
      await expect(platform.connect(owner).collectFunds(campaignId))
          .to.emit(platform, "FundsReleased");
    });

    it("Should revert when the campaign has not ended", async function () {
      // Attempt to collect funds from a campaign that has not ended
      const endDate = 1719718614; // Set the end date to a future timestamp
      await platform.createCampaign("New Campaign", "New Description", ethers.utils.parseEther("5"), endDate);
    
      const newCampaignId = 3; // Assuming the new campaign ID is 3

      await expect(platform.connect(owner).collectFunds(newCampaignId)).to.be.revertedWith("Campaign has not reached its goal or ended yet");
    });

    it("Should revert when the campaign has not reached its goal", async function () {
      // Create a new campaign
      const endDate = 1719718614; // Set the end date to a future timestamp
      await platform.createCampaign("New Campaign", "New Description", ethers.utils.parseEther("5"), endDate);
    
      const newCampaignId = 4; // Assuming the new campaign ID is 4
    
      // Increase time to make the campaign end
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // Increase time by 31 days
    
      // Attempt to collect funds from the new campaign that has not reached its goal
      await expect(platform.connect(owner).collectFunds(newCampaignId)).to.be.revertedWith("Campaign has not reached its goal or ended yet");
    });
  });
});