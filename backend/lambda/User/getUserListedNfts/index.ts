
import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";

import Web3 from "web3";
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { Category, Listing_Type, GetUserListedNftsInput, NftListing ,GetUserListedNftsOutput,Contract_Type, Blockchain_Update_Status,Sort_By,Sorting_Order } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError

import * as _contractAbis from '../../../lambdaLayers/apiDependencies/abis'
const contractAbis = require('/opt/abis') as typeof _contractAbis
import {query as q, Client} from 'faunadb'
import { parse } from "path";


type outputType = ErrorStructure | { data: GetUserListedNftsOutput }

export async function getUserListedNfts(input: GetUserListedNftsInput, faunaClient: Client):Promise<outputType> {

  console.log(input)



  const {pageSize,category,listingType,SortingOrderByTime,after,before,publicAddress,status} = input

  

  if (after && before){
    return generateError('Invalid pagination cursor, you can either define after or before, not both!', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
  }

  if (after && after.length!== 3){
    return generateError('Invalid after cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
  }

  if (before && before.length!== 3){
    return generateError('Invalid before cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
 
  }


  let faunaMatchArray = []


    if (SortingOrderByTime === Sorting_Order.Asc){

        faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_publicAddress_sortBy_ts_asc"),publicAddress))


        if (category){
  
            for (let cat of category){

                faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_category_sortBy_ts_asc"),cat))
            }

        }

        if (listingType){
            faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_listingType_sortBy_ts_asc"),listingType))
 
        }

        if (status){
            faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_blockChainStatus_sortBy_ts_asc"),status))
 
        }


    }

    else {

        faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_publicAddress_sortBy_ts_desc"),publicAddress))



         if (category){
  
              for (let cat of category){
  
                  faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_category_sortBy_ts_desc"),cat))
              }
  
          }
  
          if (listingType){
              faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_listingType_sortBy_ts_desc"),listingType))
   
          }


          
        if (status){
            faunaMatchArray.push(q.Match(q.Index("getListedNfts_searchBy_blockChainStatus_sortBy_ts_desc"),status))
 
        }
  




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

  const getListedNfts:any = await faunaClient.query(
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

  console.log("getListedNfts ", JSON.stringify(getListedNfts, undefined , 2))

   let afterOutput:string[] = []
   let beforeOutput:string[] = []


   if (getListedNfts.after){
      console.log('yo')


 afterOutput[0] = getListedNfts.after[0]
 afterOutput[1] = getListedNfts.after[1].id
 afterOutput[2] = getListedNfts.after[2].id
  }

  console.log('afterOutput',afterOutput)

  if (getListedNfts.before){
     console.log('yo')


     beforeOutput[0] = getListedNfts.before[0]
     beforeOutput[1] = getListedNfts.before[1].id
     beforeOutput[2] = getListedNfts.before[2].id
 }


   let listings: NftListing[] = []

   for (let list of getListedNfts.data){
      console.log("list ", list.data)
      const nftListing : NftListing = {...list.data, ref: list.ref.id}
      listings.push(nftListing)

   }

   console.log("nftListings ", listings);


   let output:GetUserListedNftsOutput = {listedNfts:listings}

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