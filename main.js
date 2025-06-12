//main
import { ethers } from "ethers";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
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
  approve,
  approve2,
} from './skw/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC = "https://rpc-testnet.haust.app";
const provider = new ethers.JsonRpcProvider(RPC);

const privateKeys = fs.readFileSync(path.join(__dirname, "privatekey.txt"), "utf-8")
  .split("\n")
  .map(k => k.trim())
  .filter(k => k.length > 0);


async function Warp(wallet, amountWarp) {
  try {
    const warp_abi = ["function deposit() external payable"];
    const contract = new ethers.Contract(wHAUST_address, warp_abi, wallet);

    logCache(`Swap ${amountWarp} HAUST ke → ${amountWarp} wHAUST`);

    const tx = await contract.deposit({
      value: ethers.parseEther(amountWarp),
      gasLimit: 100_000,
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap successful\n`);
  } catch (err) {
    logError(`❌ Error during Swap : ${err.message || err}`);
  }
}


async function Unwarp(wallet, amountUnwarp) {
  try {
    const amount = ethers.parseEther(amountUnwarp); 
    const unwarp_abi = ["function withdraw(uint256 wad) external"];
    const contract = new ethers.Contract(wHAUST_address, unwarp_abi, wallet);

    logCache(`Swap ${amountUnwarp} WHAUST ke → ${amountUnwarp} HAUST`);

    const tx = await contract.withdraw(amount, {
      gasLimit: 100_000,
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap successful\n`);
  } catch (err) {
    logError(`❌ Error during Swap : ${err.message || err}`);
  }
}

async function wHAUSTtoWETH(wallet, amountwHAUSTtoWETH) {
  const iface = new ethers.Interface(abi_swap);
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const expiration = Math.floor(Date.now() / 1000) + 3600 * 24;
  const commands = "0x00";
  const {amountinput } = inputamount(amountwHAUSTtoWETH);
  const inputwHAUSTtoWETH = datawHAUSTtoWETH(amountinput);

  const calldata = iface.encodeFunctionData("execute", [
    commands,
    [inputwHAUSTtoWETH],
    deadline,
  ]);

  await approve(wallet, wHAUST_address, ca_swap, amountwHAUSTtoWETH, 18, expiration);

  try {
    logCache(`Swap ${amountwHAUSTtoWETH} wHAUST ke WETH`);
    const tx = await wallet.sendTransaction({
      to: ca_swap,
      data: calldata,
      value: ethers.parseEther(amountwHAUSTtoWETH),
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap Berhasil\n`);
    return tx.hash;
  } catch (err) {
    logError(`❌ TX failed: ${err.message || err}`);
  }
}

async function wHAUSTtoWBTC(wallet, amountwHAUSTtoWBTC) {
  const asw = "0.01";
  const iface = new ethers.Interface(abi_swap);
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const expiration = Math.floor(Date.now() / 1000) + 3600 * 24;
  const commands = "0x00";
  const {amountinput } = inputamount(amountwHAUSTtoWBTC);
  const inputwHAUSTtoWBTC = datawHAUSTtoWBTC(amountinput);

  const calldata = iface.encodeFunctionData("execute", [
    commands,
    [inputwHAUSTtoWBTC],
    deadline,
  ]);

  await approve(wallet, wHAUST_address, ca_swap, amountwHAUSTtoWBTC, 18, expiration);

  try {
    logCache(`Swap ${amountwHAUSTtoWBTC} wHAUST ke WETH`);
    const tx = await wallet.sendTransaction({
      to: ca_swap,
      data: calldata,
      value: ethers.parseEther(amountwHAUSTtoWBTC),
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap Berhasil\n`);
    return tx.hash;
  } catch (err) {
    logError(`❌ TX failed: ${err.message || err}`);
  }
}

async function wHAUSTtoUSDT(wallet, amountwHAUSTtoUSDT) {
  const iface = new ethers.Interface(abi_swap);
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const expiration = Math.floor(Date.now() / 1000) + 3600 * 24;
  const commands = "0x00";
  const {amountinput } = inputamount(amountwHAUSTtoUSDT);
  const inputwHAUSTtoUSDT = datawHAUSTtoUSDT(amountinput);

  const calldata = iface.encodeFunctionData("execute", [
    commands,
    [inputwHAUSTtoUSDT],
    deadline,
  ]);

  logCache(`Swap ${amountwHAUSTtoUSDT} wHAUST ke WETH`);

  await approve(wallet, wHAUST_address, ca_swap, amountwHAUSTtoUSDT, 18, expiration);

  try {
    const tx = await wallet.sendTransaction({
      to: ca_swap,
      data: calldata,
      value: ethers.parseEther(amountwHAUSTtoUSDT),
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap Berhasil\n`);
    return tx.hash;
  } catch (err) {
    logError(`❌ TX failed: ${err.message || err}`);
  }
}

async function main() {
  console.clear();
  for (const pk of privateKeys) {
    const wallet = new ethers.Wallet(pk, provider);
    const getBalance = await provider.getBalance(wallet.address);
    const Balance = ethers.formatUnits(getBalance,18);
    const formatbalance = parseFloat(Balance).toFixed(3);
    logAccount(`Wallet : ${wallet.address}`);
    logAccount(`Balance : ${Balance} HAUST`);

    const amountWarp = "0.2";
    await Warp(wallet, amountWarp);
    await delay(5000);

    const amountUnwarp = "0.19";
    await Unwarp(wallet, amountUnwarp);
    await delay(5000);

    const amountwHAUSTtoWETH = "0.01";
    await wHAUSTtoWETH(wallet, amountwHAUSTtoWETH);
    await delay(5000);

    const amountwHAUSTtoWBTC = "0.01";
    await wHAUSTtoWBTC(wallet, amountwHAUSTtoWBTC);
    await delay(5000);

    const amountwHAUSTtoUSDT = "0.01";
    await wHAUSTtoUSDT(wallet, amountwHAUSTtoUSDT);
    await delay(5000);

  }
}

main();
