const { expect } = require("chai")
const { ethers } = require("hardhat")
require("@nomiclabs/hardhat-ethers")
const helpers = require('../scripts/helpers.js');

const provider = ethers.provider
const utils = ethers.utils

// These tests were run on a fork of mainnet
// Since it is not possible to simulate buying from Cargo on such fork
// to acquire Phunks for testing, a cloned CryptoPhunksV2 contract is deployed to mint some
describe("Test CryptoPhunksMarket Contract", function() {
  let phunks, phunksMarket, deployer, addr1, addr2
  before(async function() {
    [deployer, addr1, addr2] = await ethers.getSigners();
    // console.log("Deployer: ", deployer.address)
    // console.log("Addr1: ", addr1.address)
    phunks = await helpers.deployContract(false, "CryptoPhunksV2")
    phunksMarket = await helpers.deployContract(false, "CryptoPhunksMarket", phunks.address)
    // Minting 3 Phunks for testing
    await phunks.startSale()
    await phunks.connect(addr1).mint(3, { value: utils.parseUnits("0.15", "ether") })
  })

  describe("Test offerPhunkForSale", function() {
    it("To anyone", async function() {
      let phunkId = 0
      let amount = utils.parseUnits("5", "ether")
      await phunks.connect(addr1).approve(phunksMarket.address, phunkId);
      await phunksMarket.connect(addr1).offerPhunkForSale(phunkId, amount)
      let offer = await phunksMarket.phunksOfferedForSale(phunkId)
      expect(offer.seller).to.equal(addr1.address)
      expect(offer.minValue).to.equal(amount)
    })

    it("To a specific address", async function() {
      let phunkId = 1
      let amount = utils.parseUnits("5", "ether")
      await phunks.connect(addr1).approve(phunksMarket.address, phunkId);
      await phunksMarket.connect(addr1).offerPhunkForSaleToAddress(phunkId, amount, deployer.address)
      let offer = await phunksMarket.phunksOfferedForSale(phunkId)
      expect(offer.seller).to.equal(addr1.address)
      expect(offer.minValue).to.equal(amount)
      expect(offer.onlySellTo).to.equal(deployer.address)
    })
  })

  describe("Test buyPhunk", function() {
    it("Buy Phunk if enough ETH is sent", async function() {
      let phunkId = 0
      let amount = utils.parseUnits("5", "ether")
      let offer = await phunksMarket.phunksOfferedForSale(phunkId)
      await phunksMarket.buyPhunk(phunkId, {value: amount})
      expect(await phunks.ownerOf(phunkId)).to.equal(deployer.address)
      expect(await phunksMarket.pendingWithdrawals(offer.seller)).to.equal(amount)
    })

    it("Revert if ETH is not enough", async function() {
      let phunkId = 0
      let amount1 = utils.parseUnits("5", "ether")
      let amount2 = utils.parseUnits("1", "ether")
      // Place Phunk for sale again
      await phunks.approve(phunksMarket.address, phunkId);
      await phunksMarket.offerPhunkForSale(phunkId, amount1)

      await expect(phunksMarket.buyPhunk(phunkId, {value: amount2})).to.be.revertedWith("Transaction reverted without a reason string")
    })

    it("Revert if buyer != onlySellTo", async function() {
        let phunkId = 1
        let amount = utils.parseUnits("5", "ether")
        await expect(phunksMarket.connect(addr2).buyPhunk(phunkId, {value: amount})).to.be.revertedWith("Transaction reverted without a reason string")
    })

    it("Buy Phunk when buyer == onlySellTo", async function() {
        let phunkId = 1
        let amount = utils.parseUnits("5", "ether")
        await phunksMarket.buyPhunk(phunkId, {value: amount})
        expect(await phunks.ownerOf(phunkId)).to.equal(deployer.address)
    })
  })

  describe("Test enterBidForPhunk", function() {
    it("Enter bid if it has enough ETH", async function() {
      let phunkId = 1
      let amount = utils.parseUnits("5", "ether")
      await phunksMarket.connect(addr1).enterBidForPhunk(phunkId, {value: amount})
    })

    it("Revert if bid does not have enough ETH", async function() {
      let phunkId = 1
      let amount = utils.parseUnits("1", "ether")
      await expect(phunksMarket.connect(addr2).enterBidForPhunk(phunkId, {value: amount})).to.be.revertedWith("Transaction reverted without a reason string")
    })
  })

  describe("Test acceptBidForPhunk", function() {
    it("Revert if token has not been approved", async function() {
      let phunkId = 1
      let amount = utils.parseUnits("5", "ether")
      let pendingWithdrawals = await phunksMarket.pendingWithdrawals(deployer.address)
      await expect(phunksMarket.acceptBidForPhunk(phunkId, amount)).to.be.revertedWith("ERC721: transfer caller is not owner nor approved")
    })

    it("Accept otherwise", async function() {
      let phunkId = 1
      let amount = utils.parseUnits("5", "ether")
      await phunks.approve(phunksMarket.address, phunkId)
      let pendingWithdrawalsDif = await phunksMarket.pendingWithdrawals(deployer.address)
      await phunksMarket.acceptBidForPhunk(phunkId, amount)
      pendingWithdrawalsDif = (await phunksMarket.pendingWithdrawals(deployer.address)).sub(pendingWithdrawalsDif)
      expect(pendingWithdrawalsDif).to.equal(amount)
    })
  })

  describe("Test withdrawBidForPhunk", function() {
    it("Revert if sender != bidder", async function() {
      let phunkId = 1
      let amount = utils.parseUnits("5", "ether")
      await phunksMarket.connect(addr2).enterBidForPhunk(phunkId, {value: amount})
      await expect(phunksMarket.withdrawBidForPhunk(phunkId)).to.be.revertedWith("Transaction reverted without a reason string")
    })

    it("Withdraw otherwise", async function() {
      let phunkId = 1
      await phunksMarket.connect(addr2).withdrawBidForPhunk(phunkId)
      expect((await phunksMarket.phunkBids(phunkId)).hasBid).to.equal(false)
    })
  })

  describe("Test withdraw", function() {
    it("Successfully withdraw ETH", async function() {
      expect(await phunksMarket.pendingWithdrawals(addr1.address)).be.above(0)
      await phunksMarket.connect(addr1).withdraw()
      expect(await phunksMarket.pendingWithdrawals(addr1.address)).be.equal(0)
    })
  })

})
