import {
  usdc_address,
  usdt_address,
  wHAUST_address,
  WBTC_address,
  WETH_address,
  randomAmount,
} from "./config.js";

import {
  datawHAUSTtoUSDT,
  datawHAUSTtoWETH,
  datawHAUSTtoWBTC,
  dataUSDTtoUSDC,
  dataUSDCtoUSDT,
} from "./inputdata.js";

export const params = [
  {
    tokenIn : wHAUST_address,
    tokenOut : usdt_address,
    amountIn : randomAmount(0.01, 0.05, 2),
    datapath : datawHAUSTtoUSDT,
  },
  {
    tokenIn : wHAUST_address,
    tokenOut : WETH_address,
    amountIn : randomAmount(0.01, 0.05, 2),
    datapath : datawHAUSTtoWETH,
  },
  {
    tokenIn : wHAUST_address,
    tokenOut : WBTC_address,
    amountIn : randomAmount(0.01, 0.05, 2),
    datapath : datawHAUSTtoWBTC,
  },
  {
    tokenIn : usdt_address,
    tokenOut : usdc_address,
    amountIn : randomAmount(0.01, 0.05, 2),
    datapath : dataUSDTtoUSDC,
  },
  {
    tokenIn : usdc_address,
    tokenOut : usdt_address,
    amountIn : randomAmount(0.01, 0.05, 2),
    datapath : dataUSDCtoUSDT,
  }
];
