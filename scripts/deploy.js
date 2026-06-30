// scripts/deploy.js
// Hardhat deployment script for DinkCoin and WalletManager contracts

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy DinkCoin
  const DinkCoin = await hre.ethers.getContractFactory("DinkCoin");
  const dinkCoin = await DinkCoin.deploy();
  await dinkCoin.deployed();
  console.log("DinkCoin deployed to:", dinkCoin.address);

  // Deploy WalletManager
  const WalletManager = await hre.ethers.getContractFactory("WalletManager");
  const walletManager = await WalletManager.deploy(dinkCoin.address, deployer.address);
  await walletManager.deployed();
  console.log("WalletManager deployed to:", walletManager.address);

  // Transfer ownership of DinkCoin to WalletManager so it can mint
  await dinkCoin.transferOwnership(walletManager.address);
  console.log("DinkCoin ownership transferred to WalletManager");

  // Print summary
  console.log("--- Deployment Complete ---");
  console.log("DINK_COIN_ADDRESS=", dinkCoin.address);
  console.log("WALLET_MANAGER_ADDRESS=", walletManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 