const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { GetHistoryByNftOutput, GetHistoryByNftInput,Sorting_Order,BlockChainStatus } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import {query as q, Client} from 'faunadb';
import { History } from '../../Auth/codegenTypes';


type outputType = ErrorStructure | { data: GetHistoryByNftOutput }

export async function GetHistoryByNFT(input: GetHistoryByNftInput, faunaClient: Client):Promise<outputType> {

    console.log("input ", input);
    const {pageSize,after,before,SortingOrderByTime, tokenId} = input;

    if (after && before){
        return generateError('Invalid pagination cursor, you can either define after or before, not both!', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);

    }

    if (after && after.length!== 1){
        return generateError('Invalid after cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }

    if (before && before.length!== 1){
        return generateError('Invalid before cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError); 
    }

    let faunaMatchArray = []

    if (SortingOrderByTime === Sorting_Order.Asc){
        faunaMatchArray.push(q.Match(q.Index("getHistoryBytokenId_sortBy_ts_asc"),tokenId))
    }
    else {
        faunaMatchArray.push(q.Match(q.Index("getHistoryBytokenId_sortBy_ts_desc"),tokenId))
    }
    
    console.log('array',faunaMatchArray)

    let afterCursor;
    let beforeCursor;

    if (after){
        afterCursor = createPaginationCursor(after)
    }
    if (before){
        beforeCursor = createPaginationCursor(before)
    }

    const geHistoryByNFT:any = await faunaClient.query(
        q.Map(
            q.Paginate(
                q.Intersection(
                    ...faunaMatchArray
                ),
                { size: pageSize,
                after : afterCursor,
                before: beforeCursor
            }
            ),
            q.Lambda(["sortKey", "result"], q.Get(q.Var('result')))
        )
    )

    console.log("geHistoryByNFT ", JSON.stringify(geHistoryByNFT, undefined , 2))

     let afterOutput:string[] = []
     let beforeOutput:string[] = []


     if (geHistoryByNFT.after){
        console.log('yo')


   afterOutput[0] = geHistoryByNFT.after[0]
   afterOutput[1] = geHistoryByNFT.after[1].id
   afterOutput[2] = geHistoryByNFT.after[2].id
    }

    console.log('afterOutput',afterOutput)

    if (geHistoryByNFT.before){
       console.log('yo')


       beforeOutput[0] = geHistoryByNFT.before[0]
       beforeOutput[1] = geHistoryByNFT.before[1].id
       beforeOutput[2] = geHistoryByNFT.before[2].id
   }


     let history: History[] = []

     for (let list of geHistoryByNFT.data){
        console.log("list ", list.data)
        const nftListing : History = {...list.data, ref: list.ref.id}
        history.push(nftListing)

     }

     console.log("history ", history);


     let output:GetHistoryByNftOutput = {history:history}

     if (afterOutput)
     output.after = afterOutput

     if(beforeOutput)
     output.before = beforeOutput

     console.log("output ", output)

     return {data:output}

}


function createPaginationCursor(input:string[]){

    let afterArray = []

    afterArray[0] = parseInt(input[0])
    afterArray[1] = q.Ref(q.Collection("nftListings"), input[1])
    afterArray[2] = q.Ref(q.Collection("nftListings"), input[2])


    return afterArray
}