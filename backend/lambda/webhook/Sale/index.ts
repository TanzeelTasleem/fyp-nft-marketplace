import {History} from '../codegenTypes'
import {query as q, Client} from 'faunadb'

export async function Sale(input:any, faunaClient:Client) {
  
  
    console.log("input ", input)

    try{

        const SaleByHash:any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("uniqueTransactionByHashOnHistory"), input.transaction_hash, "Sale")),
                q.Lambda("result", q.Get(q.Var("result")))
            )
        )
    
        console.log("SaleByHash ", SaleByHash)
            
        if (SaleByHash.data.length > 0){
            const item = SaleByHash.data[0];
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

            let bidInput: History = {type: "Sale"}

            input.tokenId ? bidInput.tokenId = input.tokenId : null;
            input.price ? bidInput.salePrice = input.price : null;
            input.from ? bidInput.from = input.from : null;
            input.to ? bidInput.to = input.to : null;
            input.transaction_hash ? bidInput.transactionHash = input.transaction_hash : null;
            bidInput.statusMoralis = input.confirmed;
            input.updatedAt ? bidInput.date = input.updatedAt : null;

            console.log("bidInput ", bidInput)
            
            const createSale:any = await faunaClient.query(
                q.Create(
                q.Collection('history'),
                { data: { ...bidInput } }
                )
            )

            console.log('createSale',createSale)

            const output:History = { ...createSale.data }

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