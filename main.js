const { ethers } = require("ethers");

// Konfigurasi jaringan
const sepoliaRPC = "https://1rpc.io/sepolia";
const privateKey = "xxxxx"; // Ganti dengan private key Anda
const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(sepoliaRPC));

// Kontrak token di Sepolia
const tokens = {
  USDT: { address: "0x93C5d30a7509E60871B77A3548a5BD913334cd35", decimal: 6 },
  USDC: { address: "0xadbf21cCdFfe308a8d83AC933EF5D3c98830397F", decimal: 6 },
  WBTC: { address: "0x21472DF1B5d2b673F6444B41258C6460294a2C06", decimal: 8 }
};

// Kontrak Bridge
const bridgeContract = "0x5E2C8EF3035feeC3056864512Aaf8f4dc88CaEe3";

// Alamat tujuan di Haust Testnet
const recipient = "0x8484c09f63b7f71be164d477c81920b1aad98de2";

// Fungsi untuk mint token
async function mintToken(tokenSymbol, amount) {
  const token = tokens[tokenSymbol];
  if (!token) {
    console.error("Token tidak ditemukan!");
    return;
  }

  const tokenContract = new ethers.Contract(token.address, ["function mint(address to, uint256 amount)"], wallet);
  const amountWei = ethers.parseUnits(amount.toString(), token.decimal);

  console.log(`🔹 Minting ${amount} ${tokenSymbol}...`);
  const tx = await tokenContract.mint(recipient, amountWei);
  await tx.wait();
  console.log(`✅ Mint ${tokenSymbol} berhasil! Tx: ${tx.hash}`);
}

// Fungsi untuk approve token sebelum bridge
async function approveToken(tokenSymbol, spender) {
  const token = tokens[tokenSymbol];
  if (!token) {
    console.error("Token tidak ditemukan!");
    return;
  }

  const tokenContract = new ethers.Contract(token.address, ["function approve(address spender, uint256 value)"], wallet);
  const maxApproval = ethers.MaxUint256; // 2^256 - 1

  console.log(`🔹 Approving ${tokenSymbol} for bridging...`);
  const tx = await tokenContract.approve(spender, maxApproval);
  await tx.wait();
  console.log(`✅ Approved ${tokenSymbol}! Tx: ${tx.hash}`);
}

// Fungsi untuk bridge token
async function bridgeToken(tokenSymbol, amount) {
  const token = tokens[tokenSymbol];
  if (!token) {
    console.error("Token tidak ditemukan!");
    return;
  }

  const bridge = new ethers.Contract(bridgeContract, ["function bridgeAsset(uint32, address, uint256, address, bool, bytes)"], wallet);
  const amountWei = ethers.parseUnits(amount.toString(), token.decimal);

  console.log(`🔹 Bridging ${amount} ${tokenSymbol} to Haust Testnet...`);
  const tx = await bridge.bridgeAsset(
    1, // destinationNetwork
    recipient, // destinationAddress
    amountWei, // amount
    token.address, // token address
    true, // forceUpdateGlobalExitRoot
    "0x" // permitData kosong
  );
  await tx.wait();
  console.log(`✅ Bridging ${tokenSymbol} berhasil! Tx: ${tx.hash}`);
}

// Fungsi untuk bridge ETH
async function bridgeETH(amount) {
  const bridge = new ethers.Contract(bridgeContract, ["function bridgeAsset(uint32, address, uint256, address, bool, bytes)"], wallet);
  const amountWei = ethers.parseUnits(amount.toString(), 18);

  console.log(`🔹 Bridging ${amount} ETH to Haust Testnet...`);
  const tx = await bridge.bridgeAsset(
    1, // destinationNetwork
    recipient, // destinationAddress
    amountWei, // amount ETH
    ethers.ZeroAddress, // ETH tidak memiliki token address
    true, // forceUpdateGlobalExitRoot
    "0x", // permitData kosong
    { value: amountWei } // Kirim ETH sebagai value
  );
  await tx.wait();
  console.log(`✅ Bridging ETH berhasil! Tx: ${tx.hash}`);
}

// **Eksekusi**
(async () => {
  try {
    await mintToken("USDT", 1000000); // Mint 1000 USDT
    await mintToken("USDC", 1000000); // Mint 1000 USDC
    await mintToken("WBTC", 1000);  // Mint 0.1 WBTC

    await approveToken("USDT", bridgeContract);
    await approveToken("USDC", bridgeContract);
    await approveToken("WBTC", bridgeContract);

    await bridgeETH(0.001); // Bridge 0.01 ETH
    await bridgeToken("USDT", 1000000);
    await bridgeToken("USDC", 1000000);
    await bridgeToken("WBTC", 1000);

  } catch (error) {
    console.error("❌ Error:", error);
  }
})();
