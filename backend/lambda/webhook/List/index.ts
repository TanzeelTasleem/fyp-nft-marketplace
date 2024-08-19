import {History} from '../codegenTypes'
import {query as q, Client} from 'faunadb'

export async function List(input:any, faunaClient:Client) {
  
  
    console.log("input ", input)

    try{

        const ListByHash:any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("uniqueTransactionByHashOnHistory"), input.transaction_hash, "List")),
                q.Lambda("result", q.Get(q.Var("result")))
            )
        )
    
        console.log("ListByHash ", ListByHash)
            
        if (ListByHash.data.length > 0){
            const item = ListByHash.data[0];
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

            let bidInput: History = {type: "List"}

            input.tokenId ? bidInput.tokenId = input.tokenId : null;
            input.price ? bidInput.listPrice = input.price : null;
            input.from ? bidInput.from = input.from : null;
            input.transaction_hash ? bidInput.transactionHash = input.transaction_hash : null;
            bidInput.statusMoralis = input.confirmed;
            input.updatedAt ? bidInput.date = input.updatedAt : null;

            console.log("bidInput ", bidInput)
            
            const createList:any = await faunaClient.query(
                q.Create(
                q.Collection('history'),
                { data: { ...bidInput } }
                )
            )

            console.log('createList',createList)

            const output:History = { ...createList.data }

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

    
