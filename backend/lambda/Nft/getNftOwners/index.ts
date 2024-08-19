import axios from 'axios';
const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { GetNftOwnersInput, GetNftOwnersOutput, GetUsersNftsInput,GetUsersNftsOutput,Nft, NftOwner } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError 
import {query as q, Client} from 'faunadb'

const contractInfo = require('/opt/contractInfo')
import {marketContractAbi,marketContractAddress,tokenContractAbi,tokenContractAddress} from '../../../lambdaLayers/apiDependencies/contractInfo'

const _tokenContractAbi = contractInfo.tokenContractAbi as typeof tokenContractAbi
const _tokenContractAddress = contractInfo.tokenContractAddress as typeof tokenContractAddress

type outputType = ErrorStructure | { data: GetNftOwnersOutput }


export async function getNftOwners(input:GetNftOwnersInput, faunaClient:Client): Promise<outputType> {
    console.log(input)

   const {cursor,tokenId,limit} = input

   

   try {

      let baseUrl = `https://eth-sepolia.g.alchemy.com/nft/v3/${process.env.alchemyAPIKEY}/getOwnersForContract?contractAddress=${_tokenContractAddress}&withTokenBalances=true`;

      if (cursor){
          baseUrl = baseUrl + `&pageKey=${cursor}`
      }

      const result = await axios.get(baseUrl,{headers:{'Accept':'application/json'}})


      console.log("result.data", result.data)

      let resp = result.data as any
      resp = resp.owners
      const faunaMatchArray = [];
      const NFTDataMoralis: any = {};

      if(resp.length > 0){
         for (let res of resp){
            NFTDataMoralis[res.ownerAddress] = res.tokenBalances;
            faunaMatchArray.push(q.Match(q.Index("uniquePublicAddress"),res))
         }

         console.log("faunaMatchArray ", faunaMatchArray)

         const getUserInfo:any = await faunaClient.query(
            q.Map(
                q.Paginate(
                    q.Union(
                        ...faunaMatchArray
                    )
                ),
                q.Lambda('result', q.Get(q.Var('result')))
            )
         )
        console.log("getUserInfo ", getUserInfo)


         let users: NftOwner[] = []

         for (let list of getUserInfo.data){
            const user : NftOwner = {refId: list.ref.id}
            user.userPublicAddress = list.data.publicAddress
            user.amount = NFTDataMoralis[list.data.publicAddress].amount
            user.displayName = list.data.displayName
            user.profileImage = list.data.profileImage
            user.username = list.data.username
      
             users.push(user)
         }
      
        return {data: {data:users, count:result.data.total,cursor:result.data.cursor}}

      }

      return {data: {data:[], count:0}}

   }
   catch (e){
      const err:any = e;
      console.log('err',err.response.data.message)
      
      return generateError(err.response.data.message, { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
   }


}