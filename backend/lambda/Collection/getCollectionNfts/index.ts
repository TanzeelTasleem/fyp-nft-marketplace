const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { GetCollectionNftsInput, GetCollectionNftsOutput,Nft } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb'


type outputType = ErrorStructure | { data: GetCollectionNftsOutput }

export async function GetCollectionNfts(input: GetCollectionNftsInput, faunaClient: Client):Promise<outputType> {

    console.log("input ", input);
    const {after,before,collectionRef,pageSize} = input;

    if (after && before){
        return generateError('Invalid pagination cursor, you can either define after or before, not both!', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);

    }

    if (after && after.length!== 1){
        return generateError('Invalid after cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }

    if (before && before.length!== 1){
        return generateError('Invalid before cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError); 
    }

    let afterCursor;
    let beforeCursor;

    if (after){
        afterCursor = createPaginationCursor(after)
    }
    if (before){
        beforeCursor = createPaginationCursor(before)
    }

    const getCollectionNfts:any = await faunaClient.query(
        q.Map(
            q.Paginate(              
                q.Match(q.Index('getNftsByCollection'),collectionRef),
                { 
                    size: pageSize,
                    after : afterCursor,
                    before: beforeCursor
                }
            ),
            q.Lambda('result', q.Get(q.Var('result')))
        )
    )

    console.log("getCollectionNfts ", JSON.stringify(getCollectionNfts, undefined , 2))

     let afterOutput:string[] = []
     let beforeOutput:string[] = []


     if (getCollectionNfts.after){
         console.log('after', getCollectionNfts.after[0].id)
        afterOutput[0] = getCollectionNfts.after[0].id
     }

     if (getCollectionNfts.before){
        console.log('before', getCollectionNfts.before[0].id)
        beforeOutput[0] = getCollectionNfts.before[0].id
    }

     let nfts: Nft[] = []

     for (let list of getCollectionNfts.data){
        console.log("list ", list.data)
        const nft : Nft = {...list.data, refId: list.ref.id}
        nfts.push(nft)
     }

     console.log("collection Nfts ", nfts);


     let output:GetCollectionNftsOutput = {nfts:nfts}

     if (afterOutput)
     output.after = afterOutput

     if(beforeOutput)
     output.before = beforeOutput

     console.log("output ", output)

     return {data:output}

}



function createPaginationCursor(input:string[]){

    let afterArray = []
    afterArray[0] = q.Ref(q.Collection("nftListings"), input[0])
    return afterArray
}