const { task } = require("hardhat/config");

task("deploy", "Deploys a contract")
    .addParam("address", "The address to send the deployed contract to")
    .setAction(async (taskArgs, hre) => {
        const [deployer] = await hre.ethers.getSigners();
        const MarketplaceFactory = await hre.ethers.getContractFactory("NFTMarketplace", deployer);

        const marketplace = await MarketplaceFactory.deploy();
        await marketplace.deployed();

        console.log(`Marketplace with owner ${deployer.address} deployed to ${marketplace.address}`);
        console.log(taskArgs.address);
    });

task("NFTCreation", "Deploys a contract")
    .addParam("marketplace", "The contract's address")
    .setAction(async (taskArgs, hre) => {
        const [deployer] = await hre.ethers.getSigners();
        const MarketplaceFactory = await hre.ethers.getContractFactory("NFTMarketplace", deployer);

        const marketplace = await MarketplaceFactory.attach(taskArgs.marketplace);
        const tx = await marketplace.createNFT("TestUri");
        const receipt = await tx.wait();
        if (receipt.status === 0) {
            throw new Error("Transaction failed");
        }

        console.log(`NFT Created`);
    });

task("claimProfit", "Claims the profit from a sale")
    .addParam("marketplace", "The contract's address")
    .setAction(async (taskArgs, hre) => {
        const [deployer, firstUser] = await hre.ethers.getSigners();
        const MarketplaceFactory = await hre.ethers.getContractFactory("NFTMarketplace", deployer);

        const marketplace = await MarketplaceFactory.attach(taskArgs.marketplace);
        const tx = await marketplace.createNFT("TestUri");
        const receipt = await tx.wait();
        if (receipt.status === 0) {
            throw new Error("Transaction failed");
        }

        const tx2 = await marketplace.listNFTForSale(taskArgs.marketplace, 0, 1);
        const receipt2 = await tx2.wait();
        if (receipt2.status === 0) {
            throw new Error("Transaction 2 failed");
        }

        const marketplaceFirstUser =  marketplace.connect(firstUser);
        const tx3 = await marketplaceFirstUser.purchaseNFT(taskArgs.marketplace, 0, firstUser.address);
        const receipt3 = await tx3.wait();
        if (receipt3.status === 0) {
            throw new Error("Transaction 3 failed");
        }

        const tx4 = await marketplace.claimProfit();
        const receipt4 = await tx4.wait();
        if (receipt4.status === 0) {
            throw new Error("Transaction 4 failed");
        }

        console.log(`Profit claimed`);
    });

