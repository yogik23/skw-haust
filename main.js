import { ethers } from "ethers";
import chalk from "chalk";
import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { displayskw } from "./skw/displayskw.js";
dotenv.config();
import { params } from "./skw/params.js";

import {
  logAccount,
  logError,
  logCache,
  logInfo,
  logSuccess,
  delay,
} from "./skw/logger.js";

import {
  ca_swap,
  wHAUST_address,
  randomdelay,
  abi_swap,
  cekbalance,
  approve1,
  approve2,
} from "./skw/config.js";

import { 
  inputamount,
  inputdatabytes,
} from "./skw/inputdata.js";

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
    const getBalance = await provider.getBalance(wallet.address);
    const Balance = ethers.formatUnits(getBalance,18);
    const formatbalance = parseFloat(Balance).toFixed(3);
    logAccount(`Balance : ${Balance} HAUST`);

    if (getBalance < ethers.parseEther(amountWarp)) {
      logInfo(`Saldo HAUST tidak Cukup untuk swap ${amountWarp}`);
      return;
    }

    logCache(`Swap ${amountWarp} HAUST ke → ${amountWarp} wHAUST`);

    const tx = await contract.deposit({
      value: ethers.parseEther(amountWarp),
      gasLimit: 100_000,
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap successful\n`);
  } catch (err) {
    logError(`Error during Swap : ${err.message || err}`);
  }
}

async function Unwarp(wallet, amountUnwarp) {
  try {
    const amount = ethers.parseEther(amountUnwarp); 
    const unwarp_abi = ["function withdraw(uint256 wad) external"];
    const contract = new ethers.Contract(wHAUST_address, unwarp_abi, wallet);
    const { balancewei } = await cekbalance(wallet, wHAUST_address, 4);

    if (balancewei < ethers.parseEther(amountUnwarp)) {
      logInfo(`Saldo wHAUST tidak Cukup untuk swap ${amountUnwarp}`);
      return;
    }

    logCache(`Swap ${amountUnwarp} WHAUST ke → ${amountUnwarp} HAUST`);

    const tx = await contract.withdraw(amount, {
      gasLimit: 100_000,
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap successful\n`);
  } catch (err) {
    logError(`Error during Swap : ${err.message || err}`);
  }
}

async function swap(wallet, param) {
  const { tokenIn, tokenOut, amountIn, datapath } = param;

  const iface = new ethers.Interface(abi_swap);
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const expiration = Math.floor(Date.now() / 1000) + 3600 * 24;
  const commands = "0x00";

  const { balancewei: balanceweiIn, symbol: symbolIn, decimal: decimalIn } = await cekbalance(wallet, tokenIn);
  const amountdecimal = ethers.parseUnits(amountIn, decimalIn);

  const { symbol: symbolOut } = await cekbalance(wallet, tokenOut);

  const { amountinput } = inputamount(amountdecimal);
  const inputdata = inputdatabytes(amountinput, datapath);

  const calldata = iface.encodeFunctionData("execute", [
    commands,
    [inputdata],
    deadline,
  ]);

  if (balanceweiIn < amountdecimal) {
    logInfo(`Saldo ${symbolIn} tidak cukup untuk swap ${amountIn}`);
    return;
  }

  logInfo(`Swap ${amountIn} ${symbolIn} ke ${symbolOut}`);

  await approve1(wallet, tokenIn, amountdecimal);
  await approve2(wallet, tokenIn, ca_swap, amountdecimal, expiration);

  try {
    const tx = await wallet.sendTransaction({
      to: ca_swap,
      data: calldata,
    });

    logInfo(`Tx Dikirim https://explorer-testnet.haust.app/tx/${tx.hash}`);
    await tx.wait();
    logSuccess(`Swap Berhasil\n`);
    return tx.hash;
  } catch (err) {
    logError(`TX failed: ${err.message || err}`);
  }
}

async function sendTG(address, txCount) {
  if (process.env.SEND_TO_TG !== "true") {
    console.log("Pengirim pesan Telegram dinonaktifkan.");
    return;
  }

  const retries = 5;
  const date = new Date().toISOString().split("T")[0];
  const escape = (text) => text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");

  const message = `🌐 *Haust Testnet*\n📅 *${escape(date)}*\n👛 *${escape(address)}*\n🔣 *Total TX: ${escape(txCount)}*`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.CHAT_ID,
          text: message,
          parse_mode: "MarkdownV2",
        }
      );
      logSuccess(`Message sent to Telegram successfully!\n`);
      return response.data;
    } catch (error) {
      logError(`Error sendTG : ${error.message || error}\n`);
      if (attempt < retries) {
        await delay(3000); 
      } else {
        return null;
      }
    }
  }
}

async function startBot() {
  displayskw();
  await delay(6000);
  console.clear();
  try {
    for (const pk of privateKeys) {
      const wallet = new ethers.Wallet(pk, provider);
      logAccount(`Wallet : ${wallet.address}`);

      const amountWarp = "0.3";
      await Warp(wallet, amountWarp);
      await delay(randomdelay())

      const amountUnwarp = "0.19";
      await Unwarp(wallet, amountUnwarp);
      await delay(randomdelay())

      for (const param of params) {
        try {
          console.clear();
          logAccount(`Wallet : ${wallet.address}`);
          await swap(wallet, param);
          await delay(randomdelay());
        } catch (err) {
          logError(`Swap Param Error: ${err.message || err}`);
        }
      }

      const txCount = await provider.getTransactionCount(wallet.address);
      logAccount(`Totaltx ${wallet.address}`);
      logAccount(`-->>>: ${txCount}`);
      await sendTG(wallet.address, txCount);
      await delay(randomdelay());
    }
  } catch (err) {
    logError(`startBot Error: ${err.message || err}`);
  }
}

async function main() {
  const date = new Date().toISOString().split('T')[0];
  cron.schedule('0 1 * * *', async () => { 
    await startBot();
    console.log();
    console.log(chalk.hex('#FF00FF')(`${date} Cron AKTIF`));
    console.log(chalk.hex('#FF1493')('Besok Jam 08:00 WIB Autobot Akan Run'));
  });

  await startBot();
  console.log();
  console.log(chalk.hex('#FF00FF')(`${date} Cron AKTIF`));
  console.log(chalk.hex('#FF1493')('Besok Jam 08:00 WIB Autobot Akan Run'));
}

main();
