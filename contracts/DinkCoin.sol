// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Dink Coin (DINK) - Polygon ERC-20 Token
/// @notice Minting is restricted to the owner (bot admin). Trading is allowed.
contract DinkCoin is ERC20, Ownable {
    constructor() ERC20("Dink Coin", "DINK") {}

    /// @notice Mint new tokens to an address. Only callable by the owner.
    /// @param to The address to receive the minted tokens.
    /// @param amount The amount of tokens to mint (in wei).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
} 