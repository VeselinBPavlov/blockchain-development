require("@nomicfoundation/hardhat-toolbox");
require("./tasks");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/OeyUOIS5C_8A3GmjmEuIjDtvtkSnA1Hp",
      accounts: [""]
    }
  },
  etherscan: {
    apiKey: "P3CF6JD1REBRGM2C3JDWT9JKE47FGWZJJF"
  }
};
