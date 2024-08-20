import axios from 'axios';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { RefreshMetaDataInput,Nft } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {query as q, Client} from 'faunadb'

const contractInfo = require('/opt/contractInfo')
import {marketContractAbi,marketContractAddress,tokenContractAbi,tokenContractAddress} from '../../../lambdaLayers/apiDependencies/contractInfo'

const _tokenContractAbi = contractInfo.tokenContractAbi as typeof tokenContractAbi
const _tokenContractAddress = contractInfo.tokenContractAddress as typeof tokenContractAddress

type outputType = ErrorStructure | { data: Boolean }


export async function refreshMetadata(input:RefreshMetaDataInput, faunaClient:Client): Promise<outputType> {
    console.log(input)

   const {tokenId} = input

   try {

      let result = await axios.get(`https://deep-index.moralis.io/api/v2/nft/${_tokenContractAddress}/${tokenId}/metadata/resync?chain=${process.env.chain}&flag=metadata&mode=sync`,{headers:{'X-API-Key':`${process.env.moralisApiKey}`,'Accept':'application/json'}})

      console.log("result.data ", result.data);

      if(result.data.status === "completed"){
         let resp = await axios.get(`https://deep-index.moralis.io/api/v2/nft/${_tokenContractAddress}/${tokenId}?chain=${process.env.chain}&format=decimal`,{headers:{'X-API-Key':`${process.env.moralisApiKey}`,'Accept':'application/json'}});

         const updateNFTINFO:any = await faunaClient.query(
            q.Update(
               q.Select(
                  "ref",
                  q.Get(q.Match(q.Index('getNftByTokenId'), tokenId))
               ),
                  {
                     data:{
                           ...resp.data
                     }
                  }
               )
            )

         console.log('updateNFTINFO',updateNFTINFO)
     
         return {data: true};
      }
      else{
         return {data: false}
      }

   }
   catch (e){
      const err:any = e;
      console.log('err',err.response.data.message)
      
      return generateError(err.response.data.message, { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
   }


}