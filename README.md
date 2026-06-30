# Dink Coin

Dink Coin (DINK) is a Polygon-based ERC-20 cryptocurrency for a Discord server, rewarding users who send the first message at midnight with a minted token. Tokens are held in a temporary wallet until users claim them to a personal Polygon wallet. This repository contains the smart contracts and deployment scripts for Dink Coin, designed to integrate with a separate Discord bot repository.

## Project Overview

- **Goal**: Create an ERC-20 token (Dink Coin) on the Polygon network, with a wallet management system for temporary storage of tokens based on Discord user IDs.
- **Features**:
  - Mint 1 DINK token to the user who sends the first message at midnight, detected by a Discord bot.
  - Store tokens in a temporary wallet tied to the user’s Discord ID until claimed to a personal wallet.
  - Deploy smart contracts on Polygon Mumbai testnet for development, with plans for mainnet deployment.
- **Integration**: The Discord bot (in a separate repository) interacts with the smart contracts via `ethers.js` to mint tokens and manage wallets.

## Repository Structure

```
dink-coin/
├── contracts/
│   ├── DinkCoin.sol         # ERC-20 token contract for Dink Coin
│   └── WalletManager.sol    # Manages temporary wallets and token transfers
├── scripts/
│   └── deploy.js           # Hardhat script to deploy contracts
├── test/
│   └── DinkCoin.test.js    # Tests for smart contracts
├── hardhat.config.js       # Hardhat configuration for Polygon deployment
├── package.json            # Node.js dependencies for Hardhat
├── .env                    # Environment variables (not committed)
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Smart Contracts

- **DinkCoin.sol**: An ERC-20 token contract using OpenZeppelin, with minting restricted to the contract owner (the bot’s admin wallet).
- **WalletManager.sol**: Manages temporary wallets, mapping Discord IDs to addresses, and handles minting and claiming tokens.

## How It Works

1. **Minting Process**:
   - The Discord bot detects the first message at midnight and retrieves the user’s Discord ID.
   - The bot calls the `WalletManager` contract’s `mintToTempWallet` function, passing the Discord ID and amount (1 DINK).
   - The `WalletManager` assigns a temporary wallet address (or uses a default temporary wallet) and calls `DinkCoin` to mint tokens.
   - The transaction is sent to the Polygon network via an RPC provider (e.g., Alchemy).
2. **Temporary Wallet**:
   - Tokens are held in a temporary wallet address tied to the user’s Discord ID.
   - Users can claim tokens to a personal Polygon wallet using a bot command (e.g., `!claim <address>`), which calls `WalletManager.claimTokens`.
3. **Deployment**:
   - Contracts are deployed to the Polygon Mumbai testnet for testing using Hardhat.
   - After testing, deploy to the Polygon mainnet for production.

## Setup Instructions

### Prerequisites

- Node.js and npm installed.
- A Polygon wallet with MATIC for gas fees (Mumbai testnet for development).
- An RPC provider (e.g., Alchemy or Infura) for Polygon Mumbai and mainnet.
- Hardhat for smart contract development and deployment.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/dink-coin.git
   cd dink-coin
   ```
2. Install dependencies:

   ```bash
   npm install
   npx hardhat
   ```
3. Create a `.env` file with the following:

   ```plaintext
   POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
   PRIVATE_KEY=your_wallet_private_key_here
   ```
4. Deploy contracts to Polygon Mumbai testnet:

   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```
5. Update the Discord bot repository with the deployed contract addresses:
   - `DINK_COIN_ADDRESS`: Address of the `DinkCoin` contract.
   - `WALLET_MANAGER_ADDRESS`: Address of the `WalletManager` contract.

## Deployment (Polygon Mumbai)

1. Copy `.env.example` to `.env` and set `POLYGON_RPC_URL` and `PRIVATE_KEY`.
2. Fund the deployer wallet with test MATIC from a Mumbai faucet.
3. Install and test:

   ```bash
   npm install
   npx hardhat test
   npx hardhat run scripts/deploy.js --network mumbai
   ```

4. Copy the printed addresses into the Discord bot `.env`:
   - `DINK_COIN_ADDRESS`
   - `WALLET_MANAGER_ADDRESS`
5. Set the same wallet's private key as `BOT_WALLET_PRIVATE_KEY` in the Discord bot (this wallet owns `WalletManager` and signs mint/transfer txs).
6. Run the MySQL schema in the Discord bot repo: `scripts/dinkcoin_schema.sql`.

**Note:** `deploy.js` transfers `DinkCoin` ownership to `WalletManager` so minting works through the wallet manager contract.

## Bot Integration

The Discord bot calls:

- `WalletManager.mintToTempWallet(discordId, amount)` after a successful `_1st` claim
- `WalletManager.transferTempBalance(fromId, toId, amount)` for `_pay` transfers
- `WalletManager.getTempBalance(discordId)` for on-chain balance checks

Bot commands: `_balance`, `_ledger`, `_pay @user <amount>`.

## Testing

- Write tests in `test/DinkCoin.test.js` to verify minting, transfers, and wallet management.
- Test on the Polygon Mumbai testnet before mainnet deployment.
- Simulate midnight messages in the Discord bot to ensure correct minting.

## Security Considerations

- Restrict minting to the bot’s admin wallet using the `onlyOwner` modifier in smart contracts.
- Never commit `.env` files to Git.
- Use a dedicated wallet with minimal funds for bot transactions.
- Audit smart contracts for vulnerabilities before mainnet deployment.

## Next Steps

- Develop and test smart contracts using Hardhat.
- Integrate with the Discord bot for minting and claiming functionality.
- Deploy to Polygon mainnet after thorough testing.
- Add documentation for bot commands and user instructions.

## Contributing

Contributions are welcome! Please submit pull requests or open issues for bugs and feature requests.

## License

MIT License
