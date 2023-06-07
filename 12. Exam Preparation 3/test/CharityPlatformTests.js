const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityPlatform", function () {
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  let owner, user, platform, unlockTime, goal;

  this.beforeAll(async function () {
    [owner, user] = await ethers.getSigners();
    const { charityPlatform } = await loadFixture(deploy);    
    platform = charityPlatform;

    const charityPlatformAsOwner = charityPlatform.connect(owner);
    goal = ethers.utils.parseEther("2");
    unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    await charityPlatformAsOwner.createCampaign("Test Campaign", "Test Description", goal, unlockTime);
  });

  async function deploy() {
    const CharityPlatformFactory = await ethers.getContractFactory("CharityPlatform");
    const charityPlatform = await CharityPlatformFactory.deploy();

    return { charityPlatform };
  }

  describe("Donation", function () {
    describe("Validations", function () {
      it("Should revert when donation is 0", async function () {
        const charityPlatformAsUser = platform.connect(user);
        const campaignId = 1;
        const donation = ethers.utils.parseEther("0");
        charityPlatformAsUser.donate(campaignId, { value: donation });
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.be.revertedWith("Donation amount must be greater than 0");
      });

      it("Should revert when capaign already ended", async function () {
        const charityPlatformAsUser = platform.connect(user);
        const campaignId = 1;
        const donation = ethers.utils.parseEther("1");
        await time.increaseTo(unlockTime);
        charityPlatformAsUser.donate(campaignId, { value: donation });
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.be.revertedWith("Campaign has ended");
      });

      it("Should revert when capaign already reached goal", async function () {
        const charityPlatformAsUser = platform.connect(user);
        const campaignId = 1;
        const donation = ethers.utils.parseEther("2");
        charityPlatformAsUser.donate(campaignId, { value: donation });
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.be.revertedWith("Campaign has reached its goal");
      });
    });

    describe("Transaction", function () {
      it("Successfull donation", async function () {
        const charityPlatformAsUser = platform.connect(user);
        const campaignId = 1;
        const donation = ethers.utils.parseEther("1");       
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.emit(charityPlatformAsUser, "DonationMade")
          .withArgs(campaignId, donation);
      });
    });    
  })

  // describe("FundsRelease", function () {
  //   describe("Validations", function () {
  //     it("Should revert when campaign is not reach the goal", async function () {
  //       const charityPlatformAsOwner = platform.connect(owner);
  //       const campaignId = 1;
  //       await expect(charityPlatformAsOwner.collectFunds(campaignId))
  //         .to.be.revertedWith("Campaign has not reached its goal or ended yet");
  //     });

  //     it("Should revert when campaign is not ended", async function () {
  //       const charityPlatformAsUser = platform.connect(user);
  //       const campaignId = 1;
  //       const donation = ethers.utils.parseEther("1");
  //       charityPlatformAsUser.donate(campaignId, { value: donation });
  //       const charityPlatformAsOwner = platform.connect(owner);
  //       await time.increase(2006801559);
  //       await expect(charityPlatformAsOwner.collectFunds(campaignId))
  //         .to.be.revertedWith("Campaign has not reached its goal or ended yet");
  //     });

  //     it("Should revert user try to release funds", async function () {
  //       const charityPlatformAsUser = platform.connect(user);
  //       const campaignId = 1;
  //       await expect(charityPlatformAsUser.collectFunds(campaignId))
  //         .to.be.revertedWith("Only the creator can release funds");
  //     });
  //   });

  //   describe("Transaction", function () {
  //     // it("Should release funds", async function () {
  //     //   const charityPlatformAsUser = platform.connect(user);
  //     //   const campaignId = 1;
  //     //   const donation = ethers.utils.parseEther("1");
  //     //   charityPlatformAsUser.donate(campaignId, { value: donation });

  //     //   const charityPlatformAsOwner = platform.connect(owner);
  //     //   await expect(charityPlatformAsOwner.collectFunds(campaignId))
  //     //     .to.emit(charityPlatformAsOwner, "FundsReleased")
  //     //     .withArgs(campaignId, donation);
  //     // });
  //   });
  // });
});
