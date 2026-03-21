// hardhat.config.js — Hardhat v3 ESM, correct config schema
import { defineConfig } from 'hardhat/config';
import hardhatEthers from '@nomicfoundation/hardhat-ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY  = process.env.PRIVATE_KEY  || '0x0000000000000000000000000000000000000000000000000000000000000001';
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: {
    version: '0.8.20',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    amoy: {
      type:     'http',
      url:      AMOY_RPC_URL,
      chainId:  80002,
      accounts: [PRIVATE_KEY],   // SensitiveString[] — plain hex private key
    },
  },
});
