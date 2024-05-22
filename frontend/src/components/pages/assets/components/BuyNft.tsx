import React, { FC, useState } from 'react';
import { useAppSelector } from '../../../../redux/store';
import { Backdrop, Button } from '../../../common'
import { XIcon } from '@heroicons/react/outline';
import { S3_BUCKET } from '../../../../app-config';
import { uuid } from '../../../../utils/helper';
import { ethers } from 'ethers';

interface Props {
   assetId: string;
   assetName: string;
   collectionName: string;
   price: string;
   totalSupply: number;
   imgUrl?: string;
}

const BuyNft: FC<Props> = ({ price, assetId, assetName, collectionName, imgUrl, totalSupply }) => {
   const [open, setOpen] = useState(false);
   const handleOpen = () => { setOpen(true) }
   const handleClose = () => { setOpen(false) }
   const { marketContract } = useAppSelector(s => s.contract);
   const showDialog = useAppSelector(s => s.alerts.showDialog);

   // {ethers.utils.formatEther((price?.toString() || ""))}
   const handleBuyNow = async () => {
      // bidValue && console.log(ethers.utils.parseEther(bidValue).toString())
      const transaction = await marketContract?.buyNft(assetId, price);

      const transactionReceipt = await transaction?.wait();
      console.log("Transaction completed: ", transactionReceipt);
      handleClose()
      showDialog("success", "Congratulations!", "You own this asset now.")
   }

   return (
      <>
         <Button className='text-sm' onClick={handleOpen} >Buy Now</Button>
         {open &&
            <Backdrop open onClick={e => { e.target === e.currentTarget && handleClose() }} >
               <div className='bg-slate-100 w-[450px] rounded-lg p-2 px-4 m-2' >
                  <h3 className='text-center text-inherit border-b p-2 sm:text-2xl text-xl' >
                     Complete Purchase <XIcon onClick={handleClose} className='float-right sm:w-7 w-5 cursor-pointer' />
                  </h3>
                  <div className='flex space-x-1 items-center' >
                     <div className='bg-slate-300 min-w-[56px] h-14' >
                        {imgUrl && <img
                           src={`${S3_BUCKET.URL}/${imgUrl}?${uuid()}`}
                           className=" bg-gray-200 mx-auto rounded-2xl max-h-64 mb-1.5 "
                           alt=""
                        />}
                     </div>
                     <div className='w-full'>
                        <p>{collectionName}</p>
                        <p>{assetName} #{assetId}</p>
                     </div>
                     <div className='text-[13px] leading-[2px] w-[110px]' >
                        <p >{ethers.utils.formatEther((price.toString()))} <b className='font-bold' >MATIC</b></p>
                        <p className='text-right' >X{totalSupply}</p>
                     </div>
                  </div>
                  <br />
                  <div className='flex justify-center p-3' >
                     <Button onClick={handleBuyNow} className='text-sm' >Buy</Button>
                  </div>
               </div>
            </Backdrop>}
      </>
   )
}

export default React.memo(BuyNft);