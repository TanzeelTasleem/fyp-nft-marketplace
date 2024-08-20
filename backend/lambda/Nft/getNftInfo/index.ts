import { GetNftInfoInput, GetNftInfoOutput, Nft, NftListingInfo, Collection, BlockChainStatus } from '../codegenTypes'
import * as AWS from "aws-sdk";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { query as q, Client } from 'faunadb'
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import { blockChainListenerEvent } from '../../../lambdaLayers/apiDependencies/commonTypes'
import axios from 'axios';

type outputType = ErrorStructure | { data: GetNftInfoOutput };

export async function GetNftInfo(input: GetNftInfoInput, faunaClient: Client): Promise<outputType> {
    const { tokenId } = input;

    console.log("tokenId ", tokenId)


    try {

        const getNft: any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("getNftByTokenId"), tokenId)),
                // q.Lambda("result", q.Get(q.Var("result")))
                q.Lambda("result", 
           
                q.Let(
                 {
                   data: q.Get(q.Var("result"))
                 },
                 {
                   nftInfo:  q.Var("data"),
                   collectionInfo:  q.Get(q.Ref(q.Collection("collections"),q.Select(["data","collectionRef"],q.Var('data')))),
                 }
               )
         
         
                )
            )
        )

        console.log('output', getNft);

        if (getNft.data.length === 0) {
            return generateError("nft not found", { errorCode: error_Codes.refused }, error_Types.refused);
        }


        const getListing: any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("getListedNftByToken"), tokenId)),
                q.Lambda("result", q.Get(q.Var("result")))
            )
        )

        console.log('output', getListing);

        let isListed = false;
        let listingId = null;
        let listingType = null;
        let price = null;



        if (getListing.data.length > 0) {
            isListed = true
            listingId = getListing.data[0].data.listingId
            listingType = getListing.data[0].data.listingType
            price = getListing.data[0].data.price

        }



        const nftInfo: Nft = { ...getNft.data[0].nftInfo.data, refId: getNft.data[0].nftInfo.ref.id };

        console.log("nftInfo ", nftInfo.transactionHash)

        const collectionInfo: Collection = {...getNft.data[0].collectionInfo.data, refId: getNft.data[0].collectionInfo.ref.id }

        const listingInfo: NftListingInfo = { isListed, listingId, listingType,price }

        const output = { nftInfo, listingInfo,collectionInfo }
        return {
            data: output
        };
    }
    catch (e) {
        const err: any = e;
        console.log(err.message);
        return generateError(err.message, { errorCode: error_Codes.refused }, error_Types.refused);
    }

}