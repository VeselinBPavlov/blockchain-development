const { task } = require("hardhat/config");

task("deploy", "Deploys a contract")
    //.addParam("address", "The address to send the deployed contract to")
    .setAction(async (taskArgs, hre) => {
        const [deployer] = await hre.ethers.getSigners();
        const CharityFactory = await hre.ethers.getContractFactory("CharityPlatform", deployer);

        const charity = await CharityFactory.deploy();
        await charity.deployed();

        console.log(`Charity contract with owner ${deployer.address} deployed to address ${charity.address}`);
        // console.log(taskArgs.address);
    });

task("interaction", "Interaction for charity creation functionality")
    .addParam("address", "Charity contract address")
    .addParam("name", "Charity name")
    .addParam("description", "Charity description")
    .addParam("goal", "Charity goal")
    .addParam("endtime", "Charity end time")
    .setAction(async (taskArgs, hre) => {
      const [deployer] = await hre.ethers.getSigners();
      const CharityFactory = await hre.ethers.getContractFactory("CharityPlatform");
  
      const charity = await CharityFactory.attach(taskArgs.contractaddress);
      const tx = await charity.createCampaign(
        taskArgs.name,
        taskArgs.description,
        taskArgs.goal,
        taskArgs.endtime
      );
      await tx.wait();
  
      console.log(`Campaign created with name ${taskArgs.name} and description ${taskArgs.description}`);
    });