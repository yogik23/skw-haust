import { ethers } from "ethers";
import { 
  logAccount,
  logError,
  logCache,
  logInfo,
  logSuccess,
  delay,
} from "./logger.js";

export const ca_swap = "0xE71Af6EEd736bA513CbD19Ebc82D1Cf943b80b63";
export const ca_approve = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const usdc_address = "0x1AfB500AFfBBc8a7FC8aB0f5C4D06c59AC87B111";
export const usdt_address = "0x87054392461F52a513d83EF2e06af50f4e2F6614";
export const WETH_address = "0x48C3C36CE1DF7d5852FB4cda746015a9971A882E";
export const WBTC_address = "0x595BC82909f2311Cf19E865bc82e7930b103540C";
export const wHAUST_address = "0x6C25C1Cb4b8677982791328471be1bFB187687c1";

export const abi_swap =["function execute(bytes commands, bytes[] inputs, uint256 deadline) payable"];

export const erc20Abi = [
  "function approve(address guy, uint256 wad) public returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)"
];

export function randomAmount(min, max, decimalPlaces) {
  return (Math.random() * (max - min) + min).toFixed(decimalPlaces);
}

export function randomdelay(min = 7000, max = 15000) {
  return Math.floor(Math.random() * (max - min) + min);
}

export async function cekbalance(wallet, tokenIn) {
  try {
    const contract = new ethers.Contract(tokenIn, erc20Abi, wallet);
    const decimal = await contract.decimals();
    const symbol = await contract.symbol();
    const balancewei = await contract.balanceOf(wallet.address);
    const formatbalance = ethers.formatUnits(balancewei, decimal);
    const fixbalance = parseFloat(formatbalance).toFixed(4);
    logInfo(`Balance ${symbol} : ${fixbalance}`)
    return { balancewei, symbol, decimal } ;
  } catch (err) {
    logError(`Error Cek Balance : ${err.message || err}\n`);
  }
}

export async function approve1(wallet, tokenIn, amount) {
  const token = new ethers.Contract(tokenIn, erc20Abi, wallet);

  const allowance = await token.allowance(wallet.address, ca_approve);
  if (allowance >= amount) {
    return;
  }

  logCache(`Approve Dahulu`);

  try {
    const tx = await token.approve(ca_approve, ethers.MaxUint256);
    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Approve Berhasil`);
  } catch (err) {
    logError(`Error during Approve : ${err.message || err}`);
  }
}

export async function approve2(wallet, tokenAddress, spenderAddress, amount, expirationTimestamp) {
  const approve_abi = ["function approve(address token, address spender, uint160 amount, uint48 expiration) external"];
  const contract = new ethers.Contract(ca_approve, approve_abi, wallet);

  logCache(`Approve Dahulu`);

  try {
    const tx = await contract.approve(tokenAddress, spenderAddress, amount, expirationTimestamp);
    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Approve Berhasil`);
    logCache(`Lanjut ke Swap`);

  } catch (err) {
    logError(`Error during Approve : ${err.message || err}`);
  }
}

export async function approve3(wallet, tokenAddress, spenderAddress, amount, expirationTimestamp) {
  const approve_abi = ["function approve(address arg0, address arg1, uint160 arg2, uint48 arg3) external"];
  const contract = new ethers.Contract(ca_approve, approve_abi, wallet);

  logCache(`Approve Dahulu`);

  try {
    const tx = await contract.approve(tokenAddress, spenderAddress, amount, expirationTimestamp);
    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Approve Berhasil`);
    logCache(`Lanjut ke Swap`);

  } catch (err) {
    logError(`Error during Approve : ${err.message || err}`);
  }
}
