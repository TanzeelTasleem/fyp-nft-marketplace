import {MintNftInput,Nft, Collection,BlockChainStatus} from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import {query as q, Client} from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {blockChainListenerEvent} from '../../../lambdaLayers/apiDependencies/commonTypes'

type outputType = ErrorStructure | { data: Nft };

export async function MintNft(input:MintNftInput, faunaClient:Client, publicAddress: string, refId:string, isAdmin: boolean): Promise<outputType> {
    const {transactionhash,collectionId,collectionRef,imageUrl} = input;

    console.log("publicAddress ", publicAddress)

    // let lowerCaseAddress = publicAddress.toLocaleLowerCase();

    if(!isAdmin){
        return generateError(`API will be only run by Admin`, { errorCode: error_Codes.unAuthorized }, error_Types.unAuthorized);
    }


    try {

            const getCollection:any = await faunaClient.query(
                q.Get(
                    q.Ref(q.Collection("collections"), collectionRef)
                   )
                 )

        console.log('output',getCollection);

    if (!getCollection){
        return generateError("collection not found", { errorCode: error_Codes.refused }, error_Types.refused);
    }

    let mintNftInput = {
    collectionRef: collectionRef,
    imageUrl: imageUrl,
    transactionHash: transactionhash,
    blockChainStatus: BlockChainStatus.Started,
    }

    const mintNft:any = await faunaClient.query(
        q.Create(
          q.Collection('nfts'),
          { data: { ...mintNftInput } }
        )
    )

    console.log('mintNft',mintNft);


    
    const lambda = new AWS.Lambda();

    const Payload:blockChainListenerEvent = {
    type:"mintNft",
    transactionHash: transactionhash!,
    data: { collectionId: collectionId,nftRef:mintNft.ref.id}
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
            data: {...mintNftInput,refId:mintNft.ref.id}
        };
    }
    catch (e) {
        const err:any = e;
        console.log(err.message);
        return generateError(err.message, { errorCode: error_Codes.refused }, error_Types.refused);
    }

}