async function main() {

    const verifier = await hre.ethers.deployContract("Verifier");
    await verifier.waitForDeployment();

    console.log(
        `Verifier  deployed to ${verifier.target}`
    );

    const anonAadhaarVerifier = await hre.ethers.deployContract("AnonAadhaarVerifier", [verifier.target, "0x000000"]);
    await anonAadhaarVerifier.waitForDeployment();

    console.log(
        `AnonAadhaarVerifier  deployed to ${anonAadhaarVerifier.target}`
    );

    const vote = await hre.ethers.deployContract("Vote", ["Your gender preferences?", ["Male", "Female", "Non-binary"], anonAadhaarVerifier.target]);

    await vote.waitForDeployment();

    console.log(
        `Vote  deployed to ${vote.target}`
    )
    
    const zeroSwipes = await hre.ethers.deployContract("ZeroSwipes", [anonAadhaarVerifier.target]);
  
    await zeroSwipes.waitForDeployment();
  
    console.log(
      `ZeroSwipes  deployed to ${zeroSwipes.target}`
    );

    // Interact with the contract
    const [owner, user1, user2, user3] = await hre.ethers.getSigners();

    // User1 and User2 go live
    await zeroSwipes.connect(user1).goLive(0, { value: hre.ethers.parseEther("0.000001") });
    await zeroSwipes.connect(user2).goLive(1, { value: hre.ethers.parseEther("0.000002") });

    console.log("User1 and User2 are live");

    // User3 recommends User2 to User1
    await zeroSwipes.connect(user3).recommend(user1.address, [user2.address]);

    console.log("User3 recommended User2 to User1");

    // Fetch recommendations for User1
    const recommendations = await zeroSwipes.getRecommendations(user1.address);
    console.log("Recommendations for User1:", recommendations);

    // Match User1 and User2
    await zeroSwipes.connect(owner).matchAndDistributeBounty(user1.address, user2.address);
    console.log("Matched User1 and User2");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });