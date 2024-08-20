import { query as q, Client } from "faunadb";
import { Bid } from "./Bid";
import { Sale } from "./Sale";
import { List } from "./List";
import { TransferSingle } from "./TransferSingle";
import { Cancel } from "./Cancel";
import { Network, Alchemy } from "alchemy-sdk";
import { Wallet, ethers } from "ethers";
const abiDecoder = require("abi-decoder");
// const contractInfo = require("/opt/contractInfo");
// import {
//     marketContractAbi,
//     marketContractAddress,
//     tokenContractAbi,
//     tokenContractAddress,
//   } from "../../lambdaLayers/apiDependencies/contractInfo";

const _marketContractAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_nftContractAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "listingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bidPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			}
		],
		"name": "Bid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "listingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Cancel",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "listingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "List",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Sale",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "auctions",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "basePrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endingUnix",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startingUnix",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "cancelled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "basicSelling",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "listingUnix",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "cancelled",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "soldAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			}
		],
		"name": "bid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bids",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "highestBid",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "highestBidder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalBids",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "buyNft",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			}
		],
		"name": "cancelAuction",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			}
		],
		"name": "cancelSell",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_basePrice",
				"type": "uint256"
			}
		],
		"name": "changeAuctionBasePrice",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "changeSellPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimBalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "claimableAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_listingId",
				"type": "uint256"
			}
		],
		"name": "concludeAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_basePrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "createAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "listingId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nftContractAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC1155BatchReceived",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC1155Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC721Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "sellNft",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
// contractInfo.marketContractAbi as typeof marketContractAbi;

exports.handler = async (event: any) => {
  const body = JSON.parse(event.body);
  console.log("body ", JSON.stringify(body, undefined, 2));

  const faunaSecret = process.env.faunaSecret!;
  const faunaServer = process.env.faunaServer!;
  console.log("faunasecret", faunaSecret);
  console.log("faunaserver", faunaServer);

  var faunaClient = new Client({
    secret: faunaSecret,
    domain: faunaServer,
    port: 443,
    scheme: "https",
  });

  const activity = body.event.activity[0];

  try {
    if (activity.category === "external") {
      const transactionHash = activity.hash;

      const config = {
        apiKey: "d9AqKuE1UDjqIOz-Tz0zct0qJil1747K",
        network: Network.ETH_SEPOLIA,
      };

      const alchemy_provider = new Alchemy(config);
      const reciept = await alchemy_provider.core.getTransactionReceipt(
        transactionHash
      );

      if (!reciept?.status || reciept.status != 1) {
        console.log("transaction not successful");
        return false;
      }

      const addProductTopic0 =
        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";
      const updatePriceTopic0 =
        "0x000000000000000000000000a61630affcbc55c4535986ad36751ee321718395";
      const buyProductTopic0 =
        "0x000000000000000000000000a61630affcbc55c4535986ad36751ee321718395";

      const sellProductTopic0 =
        "0x000000000000000000000000fca350fe6fcb4c8ae8795defaf90e25ca8229026";

      let isProductAdded = reciept.logs.filter(
        (val) => val.topics[0] === addProductTopic0
      );
      let isPriceUpdated = reciept.logs.filter(
        (val) => val.topics[0] === updatePriceTopic0
      );
      let isProductBought = reciept.logs.filter(
        (val) => val.topics[0] === buyProductTopic0
      );
      let isProductSell = reciept.logs.filter(
        (val) => val.topics[0] === sellProductTopic0
      );

      console.log(
        "isProductAdded",
        JSON.stringify(isProductAdded, undefined, 2)
      );
      console.log(
        "isPriceUpdated",
        JSON.stringify(isPriceUpdated, undefined, 2)
      );
      console.log(
        "isProductBought",
        JSON.stringify(isProductBought, undefined, 2)
      );
      console.log("isProductSell", JSON.stringify(isProductSell, undefined, 2));

      console.log("typeof isProductAdded", typeof isProductAdded);
      if (isProductAdded.length > 0) {
        console.log("inside");
        const logsFromEvent = isProductAdded[0];
        let iface: ethers.utils.Interface;

        iface = new ethers.utils.Interface(_marketContractAbi);
        console.log("iface ", iface);

        const eventFragment = iface.getEvent("Sale");

        // Decode the topics
        const decodedTopics = iface.decodeEventLog(eventFragment, logsFromEvent.data, logsFromEvent.topics);

        console.log("decodedTopics  : ", JSON.stringify(decodedTopics), undefined, 2)

        const parsed = iface.parseLog(isProductAdded[0]);

        console.log("iface.parseLog(isProductAdded[0])::::::", JSON.stringify(parsed), undefined, 2)

        const args = parsed.args;

        console.log("args ", JSON.stringify(args, undefined, 2));

        abiDecoder.addABI(_marketContractAbi);

        const getTx = await alchemy_provider.core.getTransaction(
          transactionHash
        );

        console.log("getx data::::::", JSON.stringify(getTx?.data))

        const decodedInput = abiDecoder.decodeMethod(getTx?.data);

        console.log("decodedInput::::::", JSON.stringify(decodedInput, undefined, 2))

      }
    }
    // return await Sale(activity, faunaClient);
    return true;
    // console.log("body.object.className ", body.object.className)
    // switch (body.object.className) {
    //     case "Bid":
    //         return await Bid(body.object, faunaClient);
    //     case "Sales":
    //         return await Sale(body.object, faunaClient);
    //     case "Lists":
    //         return await List(body.object, faunaClient)
    //     case "TransferSingle":
    //         return await TransferSingle(body.object, faunaClient)
    //     case "Cancels":
    //         return await Cancel(body.object, faunaClient)
    //     default:
    //         throw new Error("invalid query");
    // }
  } catch (e) {
    const err: any = e;
    console.log("err ", JSON.stringify(err, undefined, 2))
    return false;
  }
};
