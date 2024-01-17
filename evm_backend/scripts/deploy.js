// scripts/deploy.js

const hre = require("hardhat");

async function main() {

    const zeroSwipes = await hre.ethers.deployContract("ZeroSwipes");
  
    await zeroSwipes.waitForDeployment();
  
    console.log(
      `ZeroSwipes  deployed to ${zeroSwipes.target}`
    );
  }
  

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
