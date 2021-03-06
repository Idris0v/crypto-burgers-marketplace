const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CBMarket", function () {
  let market;
  let marketAddress;
  let nft;
  let nftContractAddress;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    
    const CBMarket = await ethers.getContractFactory("CBMarket");
    market = await CBMarket.deploy();
    await market.deployed();
    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    nftContractAddress = nft.address;
  });

  it("Should set an owner", async function () {
    expect(await market.owner()).to.be.properAddress;
  });

  it("Should mint an NFT", async function () {
    const listingPrice = await market.listingPrice();
    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    const nftId1 = await nft.mintToken('http-uri-1');
    const nftId2 = await nft.mintToken('http-uri-2');

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice});
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice});
    const [_, buyer] = await ethers.getSigners();

    let itemsUnsold = await market.fetchMarketTokens();
    expect(itemsUnsold.length).to.equal(2);
    expect(itemsUnsold[0].sold).to.be.false;
    expect(itemsUnsold[1].sold).to.be.false;

    await market.connect(buyer).createMarketSale(nftContractAddress, 1, {value: auctionPrice});

    itemsUnsold = await market.fetchMarketTokens();
    expect(itemsUnsold.length).to.equal(1);
    expect(itemsUnsold[0].sold).to.be.false;

    const myNfts = await market.connect(buyer).fetchMyNfts();
    expect(myNfts.length).to.equal(5);
  });
});
