// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title WalletManager - Manages temporary wallets and token transfers for Dink Coin
contract WalletManager is Ownable {
    IERC20 public dinkCoin;
    address public dinkCoinMinter;

    // Discord ID => temp DINK balance
    mapping(uint256 => uint256) public tempBalances;
    // Discord ID => has claimed
    mapping(uint256 => bool) public hasClaimed;
    // Discord ID => Polygon wallet address (if claimed)
    mapping(uint256 => address) public userWallets;

    event MintedToTempWallet(uint256 indexed discordId, uint256 amount);
    event Claimed(
        uint256 indexed discordId,
        address indexed to,
        uint256 amount
    );

    constructor(address _dinkCoin, address _dinkCoinMinter) {
        dinkCoin = IERC20(_dinkCoin);
        dinkCoinMinter = _dinkCoinMinter;
    }

    /// @notice Mint tokens to a Discord user's temporary wallet (internal ledger)
    /// @dev Only callable by the owner (bot admin)
    function mintToTempWallet(
        uint256 discordId,
        uint256 amount
    ) external onlyOwner {
        address userWallet = userWallets[discordId];
        if (userWallet != address(0)) {
            // User has claimed before, mint directly to their wallet
            DinkCoin(dinkCoin).mint(userWallet, amount);
            emit MintedToTempWallet(discordId, amount); // Optionally, emit a different event
        } else {
            require(!hasClaimed[discordId], "Already claimed");
            // Mint tokens to this contract (WalletManager) as holder
            DinkCoin(dinkCoin).mint(address(this), amount);
            tempBalances[discordId] += amount;
            emit MintedToTempWallet(discordId, amount);
        }
    }

    /// @notice Claim tokens from temp wallet to a real Polygon address
    /// @dev Only callable by the owner (bot admin) for security
    function claimTokens(uint256 discordId, address to) external onlyOwner {
        require(!hasClaimed[discordId], "Already claimed");
        uint256 amount = tempBalances[discordId];
        require(amount > 0, "No tokens to claim");
        hasClaimed[discordId] = true;
        tempBalances[discordId] = 0;
        userWallets[discordId] = to;
        require(dinkCoin.transfer(to, amount), "Transfer failed");
        emit Claimed(discordId, to, amount);
    }

    /// @notice Get the temp balance for a Discord ID
    function getTempBalance(uint256 discordId) external view returns (uint256) {
        return tempBalances[discordId];
    }
}

interface DinkCoin {
    function mint(address to, uint256 amount) external;
}
// ... implementation to be added ...
