import { ethers } from "hardhat";
import * as fs from 'fs'
import myToken from '../artifacts/contracts/erc1155.sol/MyToken.json'
import marketPlace from '../artifacts/contracts/marketplace.sol/Marketplace.json'


async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy('myToken',"symb");

    console.log("Token address:", token.address);


    const market = await ethers.getContractFactory("Marketplace");
    const deployMarketPlace = await market.deploy(token.address);

    console.log("market address:", deployMarketPlace.address);

  
    //@ts-ignore
    myToken['contractAddress'] = token.address;
    fs.writeFileSync('artifacts/contracts/erc1155.sol/MyToken.json',JSON.stringify(myToken),{'encoding':'utf-8'})
    
    //@ts-ignore
    marketPlace['contractAddress'] = deployMarketPlace.address;
    fs.writeFileSync('artifacts/contracts/marketplace.sol/Marketplace.json',JSON.stringify(marketPlace),{'encoding':'utf-8'})
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });