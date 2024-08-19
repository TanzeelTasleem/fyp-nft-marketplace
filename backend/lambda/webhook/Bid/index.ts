import {History} from '../codegenTypes';
import {query as q, Client} from 'faunadb'

export async function Bid(input:any, faunaClient:Client) {
  
  
    console.log("Bid ", input)

    try{

        const BidByHash:any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("uniqueTransactionByHashOnHistory"), input.transaction_hash, "Bid")),
                q.Lambda("result", q.Get(q.Var("result")))
            )
        )
    
        console.log("BidByHash ", BidByHash)
            
        if (BidByHash.data.length > 0){
            const item = BidByHash.data[0];
            console.log("item ", item)
            if(input.confirmed === true){
                const updateBidItem:any = await faunaClient.query(
                    q.Update(
                        item.ref,
                        {
                            data:{
                                statusMoralis: input.confirmed
                            }
                        }
                        )
                        )
                
            
                console.log('updateBidItem',updateBidItem)
            }

        }
        else{

            let bidInput: History = { type: "Bid" }

            input.tokenId ? bidInput.tokenId = input.tokenId : null;
            input.bidPrice ? bidInput.bidPrice = input.bidPrice : null;
            input.bidder ? bidInput.from = input.bidder : null;
            input.transaction_hash ? bidInput.transactionHash = input.transaction_hash : null;
            bidInput.statusMoralis = input.confirmed;
            input.updatedAt ? bidInput.date = input.updatedAt : null;

            console.log("bidInput ", bidInput)
            
            const createBid:any = await faunaClient.query(
                q.Create(
                q.Collection('history'),
                { data: { ...bidInput } }
                )
            )

            console.log('createBid',createBid)

            const output:History = { ...createBid.data }

            console.log("output ", output);

        }

        return true;

    }

    catch (e) {
        const err:any = e;
        console.log("err ", err);

        return false;

    }
}

    
