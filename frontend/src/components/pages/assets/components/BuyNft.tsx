import React, { FC, useState } from 'react';
import { useAppSelector } from '../../../../redux/store';
import { Backdrop, Button, Spinner } from '../../../common'
import { XIcon } from '@heroicons/react/outline';
import { S3_BUCKET } from '../../../../app-config';
import { uuid } from '../../../../utils/helper';
import { ethers } from 'ethers';

interface Props {
   assetId: string;
   assetName: string;
   collectionName: string;
   price: string;
   listingId: string;
   sellingSupply: number;
   imgUrl?: string;
}

const BuyNft: FC<Props> = ({ price, assetId, assetName, collectionName, listingId, imgUrl, sellingSupply }) => {
   const [open, setOpen] = useState(false);
   const handleOpen = () => { setOpen(true) }
   const handleClose = () => { setOpen(false) }
   const [loading, setLoading] = useState(false);
   const { marketContract } = useAppSelector(s => s.contract);
   const showDialog = useAppSelector(s => s.alerts.showDialog);
   const [amount, setAmount] = useState(1);

   // {ethers.utils.formatEther((price?.toString() || ""))}
   const handleBuyNow = async () => {
      setLoading(true);
      try {
         // bidValue && console.log(ethers.utils.parseEther(bidValue).toString())
         if (Number(amount) > sellingSupply) {
            showDialog("error", "Error!", "You donot have enough tokens to list.");
            setLoading(false);
            return
         }
         if (Number(amount) <= 0) {
            showDialog("error", "Error!", "Amount must be greater than zero.");
            setLoading(false);
            return
         }
         const transaction = await marketContract?.buyNft(listingId, amount, price);
         const transactionReceipt = await transaction?.wait();
         console.log("Transaction completed: ", transactionReceipt);
         handleClose()
         showDialog("success", "Congratulations!", "You own this asset now.");
      } catch (error) {
         console.log("handleBuyNow_ERROR", Object.entries(error as any));
         showDialog("error", "Error!", (error as any)?.data.message || "Some thing went wrong");
      }
      setLoading(false);
   }

   return (
      <>
         <Button className='text-sm' onClick={handleOpen} >Buy for {ethers.utils.formatEther((`${price}`))} Matic</Button>
         {open &&
            <Backdrop open onClick={e => { e.target === e.currentTarget && handleClose() }} >
               <div className='bg-slate-100 w-[450px] rounded-lg p-2 px-4 m-2' >
                  <h3 className='text-center text-inherit border-b p-2 sm:text-2xl text-xl' >
                     Complete Purchase <XIcon onClick={handleClose} className='float-right sm:w-7 w-5 cursor-pointer' />
                  </h3>
                  <div className='flex space-x-1 items-center' >
                     <div className='flex justify-center items-center bg-slate-300 min-w-[56px] min-h-[56px] rounded-2xl' >
                        {imgUrl && <img
                           src={`${S3_BUCKET.URL}/${imgUrl}?${uuid()}`}
                           className=" bg-gray-200 mx-auto max-h-36 mb-1.5 rounded-2xl"
                           alt=""
                        />}
                     </div>
                     <div className='w-full'>
                        <p className='mb-1'>{collectionName}</p>
                        <p>{assetName} #{assetId}</p>
                     </div>
                     <div className='text-[13px] leading-[2px] w-[200px]' >
                        <p className='text-right' >{ethers.utils.formatEther((price.toString()))} <b className='font-bold' >MATIC</b></p>
                        <p className='text-right' >X{sellingSupply}</p>
                     </div>
                  </div>

                  <br />

                  <p className='text-right' ><b className='font-bold' >Total: </b> {ethers.utils.formatEther((`${Number(price) * amount}`))} MATIC</p>

                  <div className='border-2 px-1 rounded-lg flex items-center'>
                     <b>Amount: </b>
                     <input className='p-[3px] text-[15px] ml-1 outline-none w-full bg-transparent' type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                  </div>
                  <div className='flex justify-center p-3' >
                     <Button disabled={loading} onClick={handleBuyNow} className='text-sm' >
                        {loading ?
                           <span className="mr-1">
                              <Spinner width={15} height={15} />
                           </span> :
                           "Buy"
                        }
                     </Button>
                  </div>
               </div>
            </Backdrop>}
      </>
   )
}

export default React.memo(BuyNft);