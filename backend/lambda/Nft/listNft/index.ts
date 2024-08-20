import {NftListing,ListNftInput, Collection,BlockChainStatus,Listing_Type} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {blockChainListenerEvent} from '../../../lambdaLayers/apiDependencies/commonTypes'
import web3 from "web3";

type outputType = ErrorStructure | { data: NftListing };

export async function listNft(input:ListNftInput, faunaClient:Client, publicAddress:string): Promise<outputType> {
    const {tokenId,transactionHash} = input;


    try {

        // check if user has the nft (not done yet)

// const web3js = new web3('https://eth-sepolia.g.alchemy.com/v2/F8OcbsSaq9eXumFZZHDcifoxnyXURoNg');

// const contract = new web3js.eth.Contract(contractAbi as any, contractAddress);
// const balance = await contract.methods.balanceOf(publicAddress,tokenId).call();

// if (balance == 0){
//     return generateError("tokenId not found", { errorCode: error_Codes.refused }, error_Types.refused);

// }

        const getNft:any = await faunaClient.query(
            q.Map(
               q.Paginate(q.Match(q.Index("getNftByTokenId"), tokenId)),
               q.Lambda("result", q.Get(q.Var("result")))
               )
             )

        console.log('output',getNft);

    if (getNft.data.length === 0){
        return generateError("tokenId not found", { errorCode: error_Codes.refused }, error_Types.refused);
    }

    const nftData = getNft.data[0].data
    console.log('nftdata',nftData)

    let listNftInput = {
    listedBy: publicAddress,
    tokenId: tokenId,
    transactionHash: transactionHash,
    blockChainStatus: BlockChainStatus.Started,
    name: nftData.name,
    description:nftData.description,
    ipfsImageHash: nftData.ipfsImageHash,
    imageUrl: nftData.imageUrl
    }

    const listNft:any = await faunaClient.query(
        q.Create(
          q.Collection('nftListings'),
          { data: { ...listNftInput } }
        )
    )

    console.log('listNft',listNft);


    
    const lambda = new AWS.Lambda();

    const Payload:blockChainListenerEvent = {
    type:"listNft",
    transactionHash: transactionHash!,
    data: { tokenId: tokenId, tokenUri: getNft.data[0].data.tokenUri, listNftRef:listNft.ref.id}
    }

    let lambdaParams = {
      FunctionName: process.env.blockChainListenerName!,
      InvocationType: "Event",
      Payload: JSON.stringify(Payload),
    };

    console.log("Invoked", lambdaParams);
    const invokeLambda = await lambda.invoke(lambdaParams).promise();

    console.log(invokeLambda);


        return {
            data: {...listNftInput}
        };
    }
    catch (e) {
        const err:any = e;
        console.log(err.message);
        return generateError(err.message, { errorCode: error_Codes.refused }, error_Types.refused);
    }

}