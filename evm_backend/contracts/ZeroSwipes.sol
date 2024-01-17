// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IAnonAadhaarVerifier {
    function verifyProof(
        uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[34] calldata _pubSignals
    ) external view returns (bool);
}


contract ZeroSwipes {
    enum Gender { Male, Female, Transgender }

    struct Profile {
        bool isActive;
        uint balance;
        address addr;
        Gender seekingGender;
    }

    struct Recommendation {
        address recommender;
        uint weight;
    }

    address[] public activeMaleProfiles;
    address[] public activeFemaleProfiles;
    address[] public activeTransgenderProfiles;
    mapping(address => Profile) public profiles;
    mapping(address => mapping(address => Recommendation[])) public recommendations;

    event ProfileActivated(address indexed profile, Gender seekingGender);
    event ProfileDeactivated(address indexed profile);
    event RecommendationAdded(address indexed profile, address indexed recommended, uint weight);
    event MatchMade(address indexed profile, address indexed matchAddress);

    address public anonAadhaarVerifierAddr;

    constructor(address _verifierAddr) {
        anonAadhaarVerifierAddr = _verifierAddr;
    }

    function verify(uint256[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[34] calldata _pubSignals) public view returns (bool) {
        return IAnonAadhaarVerifier(anonAadhaarVerifierAddr).verifyProof(_pA, _pB, _pC, _pubSignals);
    }

    function goLive(Gender seekingGender) external payable {
        require(msg.value >= 10e7, "Must send at least 10e-7 ETH");
        require(!profiles[msg.sender].isActive, "Profile is already active");

        // require(verify(_pA, _pB, _pC, _pubSignals), "Your idendity proof is not valid");

        profiles[msg.sender] = Profile(true, msg.value, msg.sender, seekingGender);

        if (seekingGender == Gender.Male) {
            activeMaleProfiles.push(msg.sender);
        } else if (seekingGender == Gender.Female) {
            activeFemaleProfiles.push(msg.sender);
        } else {
            activeTransgenderProfiles.push(msg.sender);
        }

        emit ProfileActivated(msg.sender, seekingGender);
    }

    function getRandomProfiles(address profileAddress) public view returns (address[] memory) {
        // require(profiles[profileAddress].isActive, "Profile is not active");

        Gender seekingGender = profiles[profileAddress].seekingGender;
        address[] storage soughtGenderProfiles;

        if (seekingGender == Gender.Male) {
            soughtGenderProfiles = activeMaleProfiles;
        } else if (seekingGender == Gender.Female) {
            soughtGenderProfiles = activeFemaleProfiles;
        } else {
            soughtGenderProfiles = activeTransgenderProfiles;
        }

        uint profilesCount = soughtGenderProfiles.length;

        if (profilesCount == 0) {
            return new address[](0); // Return empty array if no profiles available
        }

        uint randomProfilesCount = profilesCount < 5 ? profilesCount : 5;
        address[] memory randomProfiles = new address[](randomProfilesCount);

        for (uint i = 0; i < randomProfilesCount; i++) {
            uint randomIndex = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, profileAddress, i))) % profilesCount;
            randomProfiles[i] = soughtGenderProfiles[randomIndex];
        }

        return randomProfiles;
    }

    function recommend(address profileAddress, address[] calldata recommendedAddresses) payable external {
        require(profiles[profileAddress].isActive, "Profile is not active");

        // require(verify(_pA, _pB, _pC, _pubSignals), "Your idendity proof is not valid");

        uint weight = 1 ether / recommendedAddresses.length;
        for (uint i = 0; i < recommendedAddresses.length; i++) {
            recommendations[profileAddress][recommendedAddresses[i]].push(Recommendation(msg.sender, weight));
            emit RecommendationAdded(profileAddress, recommendedAddresses[i], weight);
        }
    }

    function getRecommendations(address profileAddress) public view returns (Recommendation[] memory) {
        // Placeholder for logic to retrieve recommendations...
    }

    function matchAndDistributeBounty(address profileAddress, address matchAddress) external {
    // require(profiles[profileAddress].isActive && profiles[matchAddress].isActive, "One or both profiles are not active");

    profiles[profileAddress].isActive = false;
    profiles[matchAddress].isActive = false;

    // Distribute bounty based on recommendations
    distributeBounty(profileAddress, matchAddress);
    distributeBounty(matchAddress, profileAddress);

    emit ProfileDeactivated(profileAddress);
    emit ProfileDeactivated(matchAddress);
    emit MatchMade(profileAddress, matchAddress);
}

function distributeBounty(address profileAddress, address matchAddress) internal {
        Recommendation[] memory profileRecs = recommendations[profileAddress][matchAddress];
        uint totalWeight = 0;
        for (uint i = 0; i < profileRecs.length; i++) {
            totalWeight += profileRecs[i].weight;
        }

        for (uint i = 0; i < profileRecs.length; i++) {
            address recommender = profileRecs[i].recommender;
            uint weight = profileRecs[i].weight;
            uint share = (profiles[profileAddress].balance * weight) / totalWeight;
            payable(recommender).transfer(share);
        }
        delete recommendations[profileAddress][matchAddress];
    }

function createDefaultMaleProfile() external payable {
    require(msg.value == 1 ether || msg.value == 10e-7 ether, "Invalid amount of ETH");
    // require(verify(_pA, _pB, _pC, _pubSignals), "Your idendity proof is not valid");

    if (msg.value == 1 ether) {
        require(!profiles[msg.sender].isActive, "Profile is already active");
        profiles[msg.sender] = Profile(true, msg.value, msg.sender, Gender.Male);
        activeMaleProfiles.push(msg.sender);
        emit ProfileActivated(msg.sender, Gender.Male);
    }
    // If 10e-7 ether is sent, do nothing.
}
}
