import("dotenv").config();
import { ethers } from "hardhat";

async function main() {
  const MedicalIntegrityFactory = await ethers.getContractFactory("MedicalIntegrity");
  const contract = await MedicalIntegrityFactory.deploy();
  await contract.waitForDeployment();

  console.log("MedicalIntegrity deployed to:", contract.target);
  console.log("Deployment transaction hash:", contract.deployTransaction.hash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });