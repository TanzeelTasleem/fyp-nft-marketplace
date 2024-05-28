import { XIcon } from '@heroicons/react/outline';
import { ethers } from 'ethers';
import React, { FC, useState } from 'react'
import { S3_BUCKET } from '../../../../app-config';
import { useAppSelector } from '../../../../redux/store';
import { checkBlockChainStatus, uuid } from '../../../../utils/helper';
import { Backdrop, Button, Spinner } from '../../../common'

interface Props {
   assetId: string;
   assetName: string;
   collectionName: string;
   baseprice: string | number;
   highestPrice?: string | number;
   imgUrl?: string;
   listingId: string;

}

const PlaceBidModal: FC<Props> = ({ assetId, imgUrl, assetName, listingId, collectionName, baseprice, highestPrice }) => {
   const [open, setOpen] = useState(false);
   const handleOpen = () => { setOpen(true) }
   const handleClose = () => { setOpen(false) }
   const [bidValue, setBidValue] = useState("");
   const { marketContract } = useAppSelector(s => s.contract);
   const showDialog = useAppSelector(s => s.alerts.showDialog);
   // ethers.utils.formatUnits(weiValue, "gwei");
   const [loading, setLoading] = useState(false);

   const handlePlaceBid = async () => {
      console.log(bidValue);
      const lastBidPrice = highestPrice ?
         ethers.utils.formatEther((highestPrice.toString())) :
         ethers.utils.formatEther((baseprice.toString()))

      if (Number(bidValue) <= Number(lastBidPrice)) {
         showDialog("error", "Error!", "Bid price must be greater than the last price.");
         return
      }
      if (!bidValue) { return }
      setLoading(true);
      try {
         // bidValue && console.log(ethers.utils.parseEther(bidValue).toString())
         const transaction = await marketContract?.placeBid(listingId, bidValue);
         const transactionReceipt = await transaction?.wait();
         console.log("Transaction completed: ", transactionReceipt);
         handleClose()
         showDialog("success", "Congratulations!", "You have successfully bid on this NFT.");
      } catch (error) {
         console.log("handlePlaceBid_ERROR", Object.entries(error as any));
         if ((error as any)?.data?.message) {
            showDialog("error", "Error!", (error as any)?.data.message);
         } else if ((error as any)?.code) {
            showDialog("error", "Error!", (error as any)?.code);
         } else {
            showDialog("error", "Error!", "Some thing went wrong");
         }
      }
      setLoading(false);
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
                     <div className='text-[13px] leading-[2px] w-[150px]' >
                        <p className='text-right'>{highestPrice ? "Highest Bid:" : "Base Price:"}</p>
                        <p className='text-right' >
                           {highestPrice ? ethers.utils.formatEther((highestPrice.toString())) : ethers.utils.formatEther((baseprice.toString()))}
                           <b className='font-bold' >MATIC</b>
                        </p>
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
                     {/* <Button disabled={!bidValue} onClick={handlePlaceBid} className='text-sm' >Place Bid</Button> */}
                     <Button disabled={loading} onClick={handlePlaceBid} className='text-sm' >
                        {loading ?
                           <span className="mr-1">
                              <Spinner width={15} height={15} />
                           </span> :
                           "Place Bid"
                        }
                     </Button>
                  </div>
               </div>
            </Backdrop>}
      </>
   )
}

export default React.memo(PlaceBidModal);