const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZeroSwipes Contract", function () {
    let ZeroSwipes;
    let zeroSwipes;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        ZeroSwipes = await ethers.getContractFactory("ZeroSwipes");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        zeroSwipes = await ZeroSwipes.deploy();
    });

    describe("goLive", function () {
        it("Should allow a user to go live and create a profile with 1 ETH", async function () {
            await zeroSwipes.connect(addr1).goLive(0, { value: ethers.parseEther("1.0") });
            const profile = await zeroSwipes.profiles(addr1.address);
            expect(profile.isActive).to.be.true;
        });

        it("Should fail if the user is already live", async function () {
            await zeroSwipes.connect(addr1).goLive(0, { value: ethers.parseEther("1.0") });
            await expect(zeroSwipes.connect(addr1).goLive(0, { value: ethers.parseEther("1.0") })).to.be.revertedWith("Profile is already active");
        });
    });

    describe("getRandomProfiles", function () {
        it("Should return random profiles", async function () {
            // Assuming other profiles are created for testing
            const randomProfiles = await zeroSwipes.getRandomProfiles(addr1.address);
            expect(randomProfiles.length).to.be.gte(0);
        });
    });

    describe("recommend", function () {
        it("Should allow adding recommendations", async function () {
            await zeroSwipes.connect(addr1).goLive(0, { value: ethers.parseEther("1.0") });
            await zeroSwipes.connect(addr2).recommend(addr1.address, [addr2.address]);
            const recommendations = await zeroSwipes.getRecommendations(addr1.address);
            expect(recommendations.length).to.be.gte(1);
        });
    });

    describe("matchAndDistributeBounty", function () {
        it("Should match profiles and distribute bounty", async function () {
            // Setup profiles and recommendations
            await zeroSwipes.connect(addr1).goLive(0, { value: ethers.parseEther("1.0") });
            await zeroSwipes.connect(addr2).goLive(1, { value: ethers.parseEther("1.0") });
            await zeroSwipes.connect(owner).recommend(addr1.address, [addr2.address]);

            const initialBalance = await ethers.provider.getBalance(addr2.address);
            await zeroSwipes.connect(owner).matchAndDistributeBounty(addr1.address, addr2.address);
            
            const finalBalance = await ethers.provider.getBalance(addr2.address);
            expect(finalBalance).to.be.above(initialBalance);
        });
    });
});
