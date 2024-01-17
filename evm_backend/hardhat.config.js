require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.ankr.com/scroll_sepolia_testnet",
      },
    },
    sepolia: {
      url: "https://rpc.ankr.com/scroll_sepolia_testnet",
      chainId: 534351,
      // Add other network configuration here like accounts
      // private key
      accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2, process.env.PRIVATE_KEY_3, process.env.PRIVATE_KEY_4],
    },
  },
};
