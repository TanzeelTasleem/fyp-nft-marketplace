import { XIcon } from '@heroicons/react/outline';
import { ethers } from 'ethers';
import React, { FC, useState } from 'react'
import { S3_BUCKET } from '../../../../app-config';
import { useAppSelector } from '../../../../redux/store';
import { checkBlockChainStatus, uuid } from '../../../../utils/helper';
import { Backdrop, Button } from '../../../common'

interface Props {
   assetId: string;
   assetName: string;
   collectionName: string;
   price: string;
   imgUrl?: string;

}

const PlaceBidModal: FC<Props> = ({ assetId, imgUrl, assetName, collectionName, price, }) => {
   const [open, setOpen] = useState(false);
   const handleOpen = () => { setOpen(true) }
   const handleClose = () => { setOpen(false) }
   const [bidValue, setBidValue] = useState("");
   const { marketContract } = useAppSelector(s => s.contract);
   const showDialog = useAppSelector(s => s.alerts.showDialog);
   // ethers.utils.formatUnits(weiValue, "gwei");

   const handlePlaceBid = async () => {
      console.log(bidValue)
      if (!bidValue) { return }
      // bidValue && console.log(ethers.utils.parseEther(bidValue).toString())
      const transaction = await marketContract?.placeBid(assetId, bidValue);

      const transactionReceipt = await transaction?.wait();
      console.log("Transaction completed: ", transactionReceipt);
      handleClose()
      showDialog("success", "Congratulations!", "You have successfully bid on this NFT.")
      // showDialog("success", "Congratulations!", "you own this asset now.")
   }

   return (
      <>
         <Button className='text-sm' onClick={handleOpen} >Place Bid</Button>
         {open &&
            <Backdrop open onClick={e => { e.target === e.currentTarget && handleClose() }} >
               <div className='bg-slate-100 w-[450px] rounded-lg p-2 px-4 m-2' >
                  <h3 className='text-center text-inherit border-b p-2 sm:text-2xl text-xl' >
                     Place a bid <XIcon onClick={handleClose} className='float-right sm:w-7 w-5 cursor-pointer' />
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
                     <div className='text-[13px] leading-[2px] w-[120px]' >
                        <p>Base price:</p>
                        <p >{ethers.utils.formatEther((price.toString()))} <b className='font-bold' >MATIC</b></p>
                     </div>
                  </div>
                  <br />
                  <div className='border-2 px-1 rounded-lg flex items-center' >
                     <b>MATIC</b>
                     <input type="text" value={bidValue}
                        onChange={e => { const val = e.currentTarget.value.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/g); setBidValue(val ? val[0] : "") }}
                        className='p-[3px] ml-1 text-[15px] outline-none w-full bg-transparent'
                     />
                  </div>
                  <br />
                  <div className='flex justify-center p-3' >
                     <Button disabled={!bidValue} onClick={handlePlaceBid} className='text-sm' >Place Bid</Button>
                  </div>
               </div>
            </Backdrop>}
      </>
   )
}

export default React.memo(PlaceBidModal);