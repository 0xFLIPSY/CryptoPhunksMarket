const { expect } = require("chai")
const { ethers } = require("hardhat")
require("@nomiclabs/hardhat-ethers")

const provider = ethers.provider
const utils = ethers.utils

module.exports = {
    deployContract: async function deployContract(verify, name, ...args) {
      // Contract Details & Gas Estimation
      const Contract = await hre.ethers.getContractFactory(name);
      // Deployment
      const contract = await Contract.deploy(...args)
      //console.log("Deployed ", name, " at address: ", contract.address)
      return contract
  }
}
