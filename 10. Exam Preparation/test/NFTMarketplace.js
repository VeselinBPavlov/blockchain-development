const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let marketplaceFirstUser, deployer, firstUser, secondUser;

  this.beforeAll(async function () {
    [deployer, firstUser, secondUser] = await ethers.getSigners();
    const { marketplace } = await loadFixture(deployAndMint);
    marketplaceFirstUser = marketplace.connect(firstUser);
  });

  async function deployAndMint() {
    const [deployer, firstUser] = await ethers.getSigners();

    const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace", deployer);
    const marketplace = await MarketplaceFactory.deploy();
    const _marketplaceFirstUser = marketplace.connect(firstUser);
    const tx = await _marketplaceFirstUser.createNFT("TestUri");

    return { marketplace, deployer, firstUser };
  }

  async function list() {
    const { marketplace } = await loadFixture(deployAndMint);
    const price = ethers.utils.parseEther("1");
    await marketplaceFirstUser.approve(marketplace.address, 0);
    await marketplaceFirstUser.listNFTForSale(marketplace.address, 0, price);

    return { marketplace };
  }



  describe("Listing", function () {
    it("Reverts when price == 0", async function () {
      const { marketplace } = await loadFixture(deployAndMint);

      await expect(marketplace.listNFTForSale(marketplace.address, 0, 0))
        .to.be.revertedWith("Price must be greater than 0");
    });

    it("Revets when already listed", async function () {
      const { marketplace } = await loadFixture(deployAndMint);

      const price = ethers.utils.parseEther("1");
      await marketplaceFirstUser.approve(marketplace.address, 0);
      await marketplaceFirstUser.listNFTForSale(marketplace.address, 0, price);

      await expect(marketplaceFirstUser.listNFTForSale(marketplace.address, 0, price))
        .to.be.revertedWith("NFT is already for sale");
    });

    it("Should succeed", async function () {
      const { marketplace } = await loadFixture(deployAndMint);

      const price = ethers.utils.parseEther("1");
      await marketplaceFirstUser.approve(marketplace.address, 0);

      await expect(marketplaceFirstUser.listNFTForSale(marketplace.address, 0, price))
        .to.emit(marketplaceFirstUser, "NFTListed", marketplace.address, 0, price);
    });
  });

  describe("Purchase", function () {
    it("Reverts when not listed", async function () {
      const { marketplace } = await loadFixture(deployAndMint);

      await expect(marketplace.purchaseNFT(marketplace.address, 0, secondUser.address))
        .to.be.revertedWith("NFT is not listed for sale");
    });

    it("Reverts when price is not vlid", async function () {
      const { marketplace } = await loadFixture(list);
      const wrongPrice = ethers.utils.parseEther("2");

      await expect(marketplace.purchaseNFT(marketplace.address, 0, secondUser.address, { value: wrongPrice }))
        .to.be.revertedWith("Incorrect price");
    });

    it("Succeed", async function () {
      const { marketplace } = await loadFixture(list);
      const price = ethers.utils.parseEther("1");
      
      await marketplace.purchaseNFT(marketplace.address, 0, secondUser.address, { value: price });

      await expect((await marketplace.nftSales(marketplace.address, 0)).price).to.equal(0);
      await expect(await marketplace.ownerOf(0)).to.equal(secondUser.address);
    });
  });
});