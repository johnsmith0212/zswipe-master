const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZeroSwipes Contract Integration Test", function () {
    let ZeroSwipes;
    let zeroSwipes;
    let owner;
    let user1;
    let user2;
    let user3;

    beforeEach(async function () {
        ZeroSwipes = await ethers.getContractFactory("ZeroSwipes");
        zeroSwipes = await ZeroSwipes.deploy();
        [owner, user1, user2, user3] = await ethers.getSigners();
    });

    it("Should allow users to activate profiles", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        const profile1 = await zeroSwipes.profiles(user1.address);
        expect(profile1.isActive).to.be.true;

        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });
        const profile2 = await zeroSwipes.profiles(user2.address);
        expect(profile2.isActive).to.be.true;
    });

    it("Should return random profiles", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user3).goLive(2, { value: ethers.parseEther("1") });

        const randomProfiles = await zeroSwipes.connect(user1).getRandomProfiles(user1.address);
        expect(randomProfiles.length).to.be.greaterThan(0);
    });

    it("Should allow users to recommend profiles", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });

        await expect(zeroSwipes.connect(user1).recommend(user1.address, [user2.address]))
            .to.emit(zeroSwipes, 'RecommendationAdded')
            .withArgs(user1.address, user2.address, ethers.parseEther("1"));
    });

    it("Should match and distribute bounty", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });

        await zeroSwipes.connect(user1).recommend(user1.address, [user2.address]);

        await expect(zeroSwipes.connect(owner).matchAndDistributeBounty(user1.address, user2.address))
            .to.emit(zeroSwipes, 'MatchMade')
            .withArgs(user1.address, user2.address);
    });

    it("Should not allow activating an already active profile", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await expect(zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") }))
            .to.be.revertedWith("Profile is already active");
    });

    it("Should not allow fetching random profiles for an inactive profile", async function () {
        await expect(zeroSwipes.connect(user1).getRandomProfiles(user1.address))
            .to.be.revertedWith("Profile is not active");
    });

    it("Should handle multiple recommendations", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });

        await zeroSwipes.connect(user3).recommend(user1.address, [user2.address]);
        await zeroSwipes.connect(user3).recommend(user2.address, [user1.address]);

        // Test logic for handling multiple recommendations
    });

    it("Should distribute bounty correctly", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });

        await zeroSwipes.connect(user3).recommend(user1.address, [user2.address]);
        await zeroSwipes.connect(user3).recommend(user2.address, [user1.address]);

        const initialBalance = await ethers.provider.getBalance(user3.address);
        await zeroSwipes.connect(owner).matchAndDistributeBounty(user1.address, user2.address);
        const finalBalance = await ethers.provider.getBalance(user3.address);

        expect(finalBalance).to.be.above(initialBalance);
    });

    it("Should not allow inactive profiles to recommend", async function () {
        await expect(zeroSwipes.connect(user1).recommend(user1.address, [user2.address]))
            .to.be.revertedWith("Profile is not active");
    });

    it("Should deactivate profiles after a match", async function () {
        await zeroSwipes.connect(user1).goLive(0, { value: ethers.parseEther("1") });
        await zeroSwipes.connect(user2).goLive(1, { value: ethers.parseEther("1") });

        await zeroSwipes.connect(owner).matchAndDistributeBounty(user1.address, user2.address);

        const profile1 = await zeroSwipes.profiles(user1.address);
        const profile2 = await zeroSwipes.profiles(user2.address);

        expect(profile1.isActive).to.be.false;
        expect(profile2.isActive).to.be.false;
    });

    it("Should create a default male profile with 1 ETH", async function () {
        await zeroSwipes.connect(user1).createDefaultMaleProfile({ value: ethers.parseEther("1") });

        const profile = await zeroSwipes.profiles(user1.address);
        expect(profile.isActive).to.be.true;
        expect(profile.seekingGender).to.equal(0); // Gender.Male
    });

    it("Should not create a default male profile with incorrect ETH amount", async function () {
        await expect(zeroSwipes.connect(user1).createDefaultMaleProfile({ value: ethers.parseEther("0.5") }))
            .to.be.revertedWith("Invalid amount of ETH");
    });

    // Additional tests for all other functions and edge cases...
});
