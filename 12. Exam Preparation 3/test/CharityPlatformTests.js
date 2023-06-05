const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityPlatform", function () {
  // let charityPlatformAsUser, charityPlatform, owner, user;

  // this.beforeAll(async function () {
  //   [owner, user] = await ethers.getSigners();
  //   const { charityPlatform } = await loadFixture(deploy);
  //   charityPlatformAsUser = charityPlatform.connect(user);
  // });

  async function deploy() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

    const [owner, user] = await ethers.getSigners();
    const CharityPlatformFactory = await ethers.getContractFactory("CharityPlatform");
    const charityPlatform = await CharityPlatformFactory.deploy();

    const charityPlatformAsOwner = charityPlatform.connect(owner);
    const goal = ethers.utils.parseEther("1");
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    await charityPlatformAsOwner.createCampaign("Test Campaign", "Test Description", goal, unlockTime);

    return { charityPlatform, charityPlatformAsOwner, owner, user, unlockTime };
  }

  describe("Donation", function () {
    describe("Validations", function () {
      it("Should revert when donation is 0", async function () {
        const { charityPlatform, user } = await loadFixture(deploy);
        const charityPlatformAsUser = charityPlatform.connect(user);
        const campaignId = 0;
        const donation = ethers.utils.parseEther("0");
        charityPlatformAsUser.donate(campaignId, { value: donation });
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.be.revertedWith("Donation amount must be greater than 0");
      });

      it("Should revert when capaign already ended", async function () {
        const { charityPlatform, user, unlockTime } = await loadFixture(deploy);
        const charityPlatformAsUser = charityPlatform.connect(user);
        const campaignId = 0;
        const donation = ethers.utils.parseEther("1");
        await time.increase(unlockTime);
        charityPlatformAsUser.donate(campaignId, { value: donation });
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.be.revertedWith("Campaign has ended");
      });

      it("Should revert when capaign already reached goal", async function () {
        const { charityPlatform, user, unlockTime } = await loadFixture(deploy);
        await time.increase(unlockTime - 1);
        const charityPlatformAsUser = charityPlatform.connect(user);
        const campaignId = 0;
        const donation = ethers.utils.parseEther("1");
        charityPlatformAsUser.donate(campaignId, { value: donation });
        await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
          .to.be.revertedWith("Campaign has reached goal");
      });
    });

    // describe("Transaction", function () {
    //   it("Successfull donation", async function () {
    //     const { charityPlatform, user } = await loadFixture(deploy);
    //     const charityPlatformAsUser = charityPlatform.connect(user);
    //     const campaignId = 0;
    //     const donation = ethers.utils.parseEther("1");       
    //     await expect(charityPlatformAsUser.donate(campaignId, { value: donation }))
    //       .to.emit(charityPlatformAsUser, "DonationMade")
    //       .withArgs(campaignId, donation);
    //   });
    // });    
  })

  describe("FundsRelease", function () {
    // describe("Validations", function () {
    //   it("Should revert when campaign is not ended", async function () {
    //     const { charityPlatform, owner } = await loadFixture(deploy);
    //     const charityPlatformAsOwner = charityPlatform.connect(owner);
    //     const campaignId = 0;
    //     await time.increase(1686801559);
    //     await expect(charityPlatformAsOwner.collectFunds(campaignId))
    //       .to.be.revertedWith("Campaign has not reached its goal or ended yet");
    //   });

    //   it("Should revert when campaign is not ended", async function () {
    //     const { charityPlatform, user } = await loadFixture(deploy);
    //     const charityPlatformAsUser = charityPlatform.connect(user);
    //     const campaignId = 0;
    //     const donation = ethers.utils.parseEther("1");
    //     charityPlatformAsUser.donate(campaignId, { value: donation });
    //     await time.increase(1686801559);
    //     await expect(charityPlatformAsOwner.collectFunds(campaignId))
    //       .to.be.revertedWith("Campaign has not reached its goal or ended yet");
    //   });

    //   it("Should revert user try to release funds", async function () {
    //     const { charityPlatform, user } = await loadFixture(deploy);
    //     const charityPlatformAsUser = charityPlatform.connect(user);
    //     const campaignId = 0;
    //     await expect(charityPlatformAsUser.collectFunds(campaignId))
    //       .to.be.revertedWith("Only the creator can release funds");
    //   });
    // });

    // describe("Transaction", function () {
    //   it("Should release funds", async function () {
    //     const { charityPlatform, owner, user } = await loadFixture(deploy);

    //     const charityPlatformAsUser = charityPlatform.connect(user);
    //     const campaignId = 0;
    //     const donation = ethers.utils.parseEther("1");
    //     charityPlatformAsUser.donate(campaignId, { value: donation });

    //     const charityPlatformAsOwner = charityPlatform.connect(owner);
    //     await expect(charityPlatformAsOwner.collectFunds(campaignId))
    //       .to.emit(charityPlatformAsOwner, "FundsReleased")
    //       .withArgs(campaignId, donation);
    //   });
    // });
  });
});
