require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const { POLYGON_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: POLYGON_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
}; 