import { ethers } from "ethers";
import chalk from "chalk";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logAccount = (message) => console.log(chalk.hex('#A259FF')(`🟣 ${message}`));
const logInfo = (message) => console.log(chalk.hex('#48D1CC')(`🔵 ${message}`));
const logSuccess = (message) => console.log(chalk.hex('#00FF00')(`🟢 ${message}`));
const logCache = (message) => console.log(chalk.hex('#FF8C00')(`🟡 ${message}`));
const logError = (message) => console.log(chalk.hex('#FF6347')(`🔴 ${message}`));
const logWarning  = msg => console.log(chalk.hex('#A52A2A')(`🟠 ${msg}`));

const ca_swap = "0xE71Af6EEd736bA513CbD19Ebc82D1Cf943b80b63";
const ca_routerv3 = "0x86fBDc47994966e14d8BA13f9ED546189641dF71";
const ca_approve = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const usdc_address = "0x1AfB500AFfBBc8a7FC8aB0f5C4D06c59AC87B111";
const usdt_address = "0x87054392461F52a513d83EF2e06af50f4e2F6614";
const wHAUST_address = "0x6C25C1Cb4b8677982791328471be1bFB187687c1";

const abi_swap =["function execute(bytes commands, bytes[] inputs, uint256 deadline) payable"];

const erc20Abi = [
  "function approve(address guy, uint256 wad) public returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

function inputamount(amount) {
  const weiAmount = ethers.parseUnits(amount, 18);
  const padded = ethers.zeroPadValue(ethers.toBeHex(weiAmount), 32);
  const plushex = "0x0000000000000000000000000000000000000000000000000000000000000002";
  const amountinput = padded.slice(2);
  const amountpadded = plushex + padded.slice(2);
  return { amountpadded, amountinput };
}

function datahaustUSDC(amountinput) {
  const USDCInstruction = '0x0000000000000000000000000000000000000000000000000000000000000001' + amountinput + '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000426c25c1cb4b8677982791328471be1bfb187687c10001f487054392461f52a513d83ef2e06af50f4e2f66140001f41afb500affbbc8a7fc8ab0f5c4d06c59ac87b111000000000000000000000000000000000000000000000000000000000000';
  return USDCInstruction;
}

function datahaustUSDT(amountinput) {
  const USDTInstruction = '0x0000000000000000000000000000000000000000000000000000000000000001' + amountinput + '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000596c25c1cb4b8677982791328471be1bfb187687c1000bb81afb500affbbc8a7fc8ab0f5c4d06c59ac87b1110000646c25c1cb4b8677982791328471be1bfb187687c1000bb887054392461f52a513d83ef2e06af50f4e2f661400000000000000';
  return USDTInstruction;
}

function datawHAUSTtoWETH(amountinput) {
  const wHAUSTtoWETHInstruction = '0x0000000000000000000000000000000000000000000000000000000000000001' + amountinput + '00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b6c25c1cb4b8677982791328471be1bfb187687c1000bb848c3c36ce1df7d5852fb4cda746015a9971a882e000000000000000000000000000000000000000000';
  return wHAUSTtoWETHInstruction;
}

function datawHAUSTtoWBTC(amountinput) {
  const wHAUSTtoWBTCInstruction = '0x0000000000000000000000000000000000000000000000000000000000000001' + amountinput + '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b6c25c1cb4b8677982791328471be1bfb187687c10001f4595bc82909f2311cf19e865bc82e7930b103540c000000000000000000000000000000000000000000';
  return wHAUSTtoWBTCInstruction;
}

function datawHAUSTtoUSDT(amountinput) {
  const wHAUSTtoUSDTInstruction = '0x0000000000000000000000000000000000000000000000000000000000000001' + amountinput + '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b6c25c1cb4b8677982791328471be1bfb187687c10001f487054392461f52a513d83ef2e06af50f4e2f6614000000000000000000000000000000000000000000';
  return wHAUSTtoUSDTInstruction;
}

async function approve1(wallet, amount) {
  const token = new ethers.Contract(wHAUST_address, erc20Abi, wallet);
  const parsedAmount = ethers.parseUnits(amount, 18);

  const allowance = await token.allowance(wallet.address, ca_approve);
  if (allowance >= parsedAmount) {
    return;
  }

  logCache(`Approving tokens...`);

  try {
    const tx = await token.approve(ca_approve, ethers.MaxUint256);
    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Approve successful\n`);
  } catch (err) {
    logError(`Error during Approve : ${err.message || err}`);
  }
}

async function approve2(wallet, tokenAddress, spenderAddress, amount, decimals, expirationTimestamp) {
  const approve_abi = ["function approve(address token, address spender, uint160 amount, uint48 expiration) external"];
  const contract = new ethers.Contract(ca_approve, approve_abi, wallet);
  const parsedAmount = ethers.parseUnits(amount, decimals);

  logCache(`Mengirim Approve...`);

  try {
    const tx = await contract.approve(tokenAddress, spenderAddress, parsedAmount, expirationTimestamp);
    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Approve Berhasil`);
  } catch (err) {
    logError(`❌ Error during Approve : ${err.message || err}`);
  }
}

export {
  delay,
  logAccount,
  logInfo,
  logSuccess,
  logCache,
  logError,
  logWarning,
  ca_swap,
  ca_approve,
  usdc_address,
  usdt_address,
  wHAUST_address,
  abi_swap,
  inputamount,
  datahaustUSDC,
  datahaustUSDT,
  datawHAUSTtoWETH,
  datawHAUSTtoWBTC,
  datawHAUSTtoUSDT,
  approve1,
  approve2,
};
