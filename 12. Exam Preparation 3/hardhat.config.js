require("@nomicfoundation/hardhat-toolbox");
require("./tasks");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/OeyUOIS5C_8A3GmjmEuIjDtvtkSnA1Hp",
      accounts: ["3d3a72ac4e5c0b20d7cb981dae1db97843c50bb414db75f88e57cd96feef4f70"]
    }
  },
  etherscan: {
    apiKey: "P3CF6JD1REBRGM2C3JDWT9JKE47FGWZJJF"
  }
};
