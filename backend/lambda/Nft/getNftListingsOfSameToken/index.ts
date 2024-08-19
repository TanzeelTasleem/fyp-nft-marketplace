const errorHandlingTemplate = require('/opt/errorHandlingTemplate')
import { errorCodes, ErrorStructure, errorTypes, returnError } from '../../../lambdaLayers/apiDependencies/errorHandlingTemplate'
import { GetListedNftsInput, GetListedNftsOutput, NftListing, Sorting_Order, BlockChainStatus,NftOwner, GetNftListingsOfSameTokenOutput } from "../codegenTypes";
const error_Codes = errorHandlingTemplate.errorCodes as typeof errorCodes
const error_Types = errorHandlingTemplate.errorTypes as typeof errorTypes
const generateError = errorHandlingTemplate.returnError as typeof returnError
import { query as q, Client } from 'faunadb';
import { GetNftListingsOfSameTokenInput } from '../../Auth/codegenTypes';


type outputType = ErrorStructure | { data: GetNftListingsOfSameTokenOutput }

export async function getNftListingsOfSameToken(input: GetNftListingsOfSameTokenInput, faunaClient: Client):Promise<outputType> {

    console.log("input ", input);
    const { after, before, tokenId,pageSize } = input;


    if (after && before) {
        return generateError('Invalid pagination cursor, you can either define after or before, not both!', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);

    }

    if (after && after.length !== 1) {
        return generateError('Invalid after cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }

    if (before && before.length !== 1) {
        return generateError('Invalid before cursor for pagination', { errorCode: error_Codes.internalServerError }, error_Types.internalServerError);
    }




    let afterCursor;
    let beforeCursor;

    if (after) {
        afterCursor = createPaginationCursor(after)
    }
    if (before) {
        beforeCursor = createPaginationCursor(before)
    }

    const geListings: any = await faunaClient.query(
        q.Map(
            q.Paginate(q.Match(q.Index("getListedNftByToken"), tokenId),
                {
                    size: pageSize,
                    after: afterCursor,
                    before: beforeCursor
                }
            ),
            q.Lambda("result", 
           
           q.Let(
            {
              data: q.Get(q.Var("result"))
            },
            {
              listing:  q.Get(q.Var("result")),
              user:  q.Map(q.Paginate(q.Match(q.Index("uniquePublicAddress"),q.Select(["data","listedBy"],q.Var('data')))),        q.Lambda("result", q.Get(q.Var("result"))))

            }
          )
    
    
           )
        )
    )

    console.log("getListedNfts ", geListings.data[0])

    let afterOutput: string[] = []
    let beforeOutput: string[] = []



    if (geListings.after){
        console.log('after', geListings.after[0].id)
       afterOutput[0] = geListings.after[0].id
    }

    if (geListings.before){
       console.log('before', geListings.before[0].id)
       beforeOutput[0] = geListings.before[0].id
   }



    let listings: NftOwner[] = []

    for (let list of geListings.data) {
        console.log("list ", list)
        const nftListing: NftOwner = {userPublicAddress:list.user.data[0].data.publicAddress,refId:list.listing.ref.id,username:list.user.data[0].data.username,profileImage:list.user.data[0].data.profileImage,displayName:list.user.data[0].data.displayName,amount:null,listingInfo:{amount:list.listing.data.amount,price:list.listing.data.price}}
        listings.push(nftListing)

    }

    console.log("nftListings ", listings);


    let output: GetNftListingsOfSameTokenOutput = { data:listings }

    if (afterOutput)
        output.after = afterOutput

    if (beforeOutput)
        output.before = beforeOutput

    console.log("output ", output)

return { data:output }

}



function createPaginationCursor(input:string[]){

    let afterArray = []
    afterArray[0] = q.Ref(q.Collection("nftListings"), input[0])
    return afterArray
}