// scripts/deploy.mjs — Hardhat v3 with hardhat-ethers plugin
import hardhatEthers from '@nomicfoundation/hardhat-ethers';
import { network } from 'hardhat';

async function main() {
  // Hardhat v3: ethers lives on the network connection, not hre directly
  const { ethers } = await network.connect();

  console.log('\n Deploying MedicalIntegrity to Polygon Amoy ...\n');

  const signers  = await ethers.getSigners();
  const deployer = signers[0];
  console.log('   Deployer :', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('   Balance  :', ethers.formatEther(balance), 'POL\n');

  if (balance === 0n) {
    console.error('ERROR: Wallet has 0 POL — cannot pay gas.');
    console.error('   Get free Amoy POL at: https://faucet.polygon.technology');
    process.exit(1);
  }

  const Factory  = await ethers.getContractFactory('MedicalIntegrity');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address  = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log('Contract deployed!');
  console.log('   Address          :', address);
  console.log('   Deploy TX Hash   :', deployTx.hash);
  console.log('   PolygonScan      : https://amoy.polygonscan.com/tx/' + deployTx.hash);
  console.log('\nNow copy these into frontend/.env.local:');
  console.log('   ADMIN_PRIVATE_KEY=<same value as PRIVATE_KEY in root .env>');
  console.log('   INTEGRITY_CONTRACT_ADDRESS=' + address);
  console.log('   CONTRACT_ADDRESS='           + address);
  console.log('   POLYGON_RPC_URL=https://rpc-amoy.polygon.technology\n');
}

main().catch((err) => { console.error('Deploy failed:', err); process.exit(1); });
