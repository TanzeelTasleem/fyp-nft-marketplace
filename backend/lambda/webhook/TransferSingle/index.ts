import {History} from '../codegenTypes'
import {query as q, Client} from 'faunadb'

export async function TransferSingle(input:any, faunaClient:Client) {
  
  
    console.log("input ", input)

    if(input.from === "0x0000000000000000000000000000000000000000"){
        return false;
    }

    if(input.to === "0x0000000000000000000000000000000000000000"){
        return false;
    }

    if(input.from.toLowerCase() === process.env.contractAddress?.toLowerCase()){
        return false;
    }

    if(input.to.toLowerCase() === process.env.contractAddress?.toLowerCase()){
        return false;
    }

    try{

        const TransferByHash:any = await faunaClient.query(
            q.Map(
                q.Paginate(q.Match(q.Index("uniqueTransactionByHashOnHistory"), input.transaction_hash, "TransferSingle")),
                q.Lambda("result", q.Get(q.Var("result")))
            )
        )
    
        console.log("TransferByHash ", TransferByHash)
            
        if (TransferByHash.data.length > 0){
            const item = TransferByHash.data[0];
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

            let bidInput: History = {type: "TransferSingle"}

            input.uid ? bidInput.tokenId = input.uid : null;
            input.from ? bidInput.from = input.from : null;
            input.to ? bidInput.to = input.to : null;
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