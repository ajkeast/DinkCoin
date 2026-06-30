const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DinkCoin and WalletManager", function () {
  const ONE_DINK = ethers.utils.parseEther("1");
  const DISCORD_ID_A = 111111111;
  const DISCORD_ID_B = 222222222;

  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();

    const DinkCoin = await ethers.getContractFactory("DinkCoin");
    const dinkCoin = await DinkCoin.deploy();
    await dinkCoin.deployed();

    const WalletManager = await ethers.getContractFactory("WalletManager");
    const walletManager = await WalletManager.deploy(
      dinkCoin.address,
      owner.address
    );
    await walletManager.deployed();

    await dinkCoin.transferOwnership(walletManager.address);

    return { owner, user, dinkCoin, walletManager };
  }

  it("mints to temp wallet and tracks balance", async function () {
    const { walletManager } = await deployFixture();

    await expect(
      walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK)
    )
      .to.emit(walletManager, "MintedToTempWallet")
      .withArgs(DISCORD_ID_A, ONE_DINK);

    expect(await walletManager.getTempBalance(DISCORD_ID_A)).to.equal(ONE_DINK);
  });

  it("transfers temp balance between users", async function () {
    const { walletManager } = await deployFixture();

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);
    const half = ethers.utils.parseEther("0.5");

    await expect(
      walletManager.transferTempBalance(DISCORD_ID_A, DISCORD_ID_B, half)
    )
      .to.emit(walletManager, "TransferredBetweenUsers")
      .withArgs(DISCORD_ID_A, DISCORD_ID_B, half);

    expect(await walletManager.getTempBalance(DISCORD_ID_A)).to.equal(half);
    expect(await walletManager.getTempBalance(DISCORD_ID_B)).to.equal(half);
  });

  it("rejects transfer with insufficient balance", async function () {
    const { walletManager } = await deployFixture();

    await expect(
      walletManager.transferTempBalance(
        DISCORD_ID_A,
        DISCORD_ID_B,
        ONE_DINK
      )
    ).to.be.revertedWith("Insufficient balance");
  });

  it("rejects self transfer", async function () {
    const { walletManager } = await deployFixture();

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);

    await expect(
      walletManager.transferTempBalance(DISCORD_ID_A, DISCORD_ID_A, ONE_DINK)
    ).to.be.revertedWith("Cannot transfer to self");
  });

  it("claims temp balance to a polygon address", async function () {
    const { user, dinkCoin, walletManager } = await deployFixture();

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);

    await expect(walletManager.claimTokens(DISCORD_ID_A, user.address))
      .to.emit(walletManager, "Claimed")
      .withArgs(DISCORD_ID_A, user.address, ONE_DINK);

    expect(await walletManager.getTempBalance(DISCORD_ID_A)).to.equal(0);
    expect(await walletManager.hasClaimed(DISCORD_ID_A)).to.equal(true);
    expect(await dinkCoin.balanceOf(user.address)).to.equal(ONE_DINK);
  });

  it("rejects double claim", async function () {
    const { user, walletManager } = await deployFixture();

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);
    await walletManager.claimTokens(DISCORD_ID_A, user.address);

    await expect(
      walletManager.claimTokens(DISCORD_ID_A, user.address)
    ).to.be.revertedWith("Already claimed");
  });

  it("mints directly to wallet after claim", async function () {
    const { user, dinkCoin, walletManager } = await deployFixture();

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);
    await walletManager.claimTokens(DISCORD_ID_A, user.address);

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);

    expect(await dinkCoin.balanceOf(user.address)).to.equal(
      ethers.utils.parseEther("2")
    );
  });

  it("rejects transfer after sender has claimed", async function () {
    const { user, walletManager } = await deployFixture();

    await walletManager.mintToTempWallet(DISCORD_ID_A, ONE_DINK);
    await walletManager.claimTokens(DISCORD_ID_A, user.address);

    await expect(
      walletManager.transferTempBalance(
        DISCORD_ID_A,
        DISCORD_ID_B,
        ONE_DINK
      )
    ).to.be.revertedWith("Sender has claimed");
  });
});
