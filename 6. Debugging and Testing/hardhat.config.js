require("@nomicfoundation/hardhat-toolbox");
require("./tasks");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://sepolia.infura.io/v3/<key>",
      // accounts: [privateKey1, privateKey2]
    }
  },
  solidity: "0.8.18",
};
