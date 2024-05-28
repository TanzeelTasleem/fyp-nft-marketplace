import React, { FC, useEffect, useState } from "react"
import { APPSYNC_GRAPHQL, PAGES } from "../../../../../app-config"
import { useAppSelector } from "../../../../../redux/store"
import { Button, Layout, Seo, Spinner } from "../../../../common"
// import { RouteComponentProps } from "@reach/router"
// import Clock from "../../../../common/Clock"
import { listNft } from "../../../../../graphql/mutations"
import { MutationListNftArgs, Nft, NftListing, QueryGetNftInfoArgs } from "../../../../../graphql/types"
import { checkBlockChainStatus } from "../../../../../utils/helper"
import { Form, Formik, FormikHelpers, ErrorMessage } from "formik"
// import { validationSchema } from "./validation"
import Input from "../../../../common/Input"
import * as Yup from 'yup';
import { API } from "aws-amplify"
// import { getNftInfo } from "../../../../../graphql/queries"
import { NFTmeta, GraphQLResult } from "../../../../../utils/global-types"
import { ContractTransaction } from "ethers"
import { navigate } from "gatsby"

type ListType = "FIXED_PRICED" | "TIMED_AUCTION";
const formSchema = Yup.object({
   listingType: Yup.mixed<ListType>().required("Required"),
   price: Yup.string(),
   basePrice: Yup.string(),
   numberOfTokens: Yup.string(),
   // durationInSecs: Yup.string(),
})

export interface FormFields extends Yup.InferType<typeof formSchema> { }

let formInitialValues: FormFields = {
   listingType: "FIXED_PRICED",
   price: "",
   basePrice: "",
   numberOfTokens: "1",
   // durationInSecs: "",
};



const ListNftForm: FC<{ assetId: number, nftInfo: Nft, nftMeta?: NFTmeta }> = ({ assetId, nftInfo, nftMeta }) => {
   const { marketContract, nftContract } = useAppSelector(s => s.contract);
   const { userData } = useAppSelector(s => s.userAuth);
   const [submittingStatus, setSubmittingStatus] = useState<string | null>(null);
   const showDialog = useAppSelector(s => s.alerts.showDialog);
   // const [loading, setLoading] = useState(false);
   // const [nftInfo, setNftInfo] = useState<Nft>();
   // const [nftMeta, setNftmeta] = useState<NFTmeta>();
   const isAuctionAllowed = Number(nftInfo?.amount || 0) === 1;

   // useEffect(() => {

   //    // marketContract && nftContract && nftContract.setApprovalForAll(marketContract.ADDRESS)
   //    // marketContract && nftContract && userData?.publicAddress &&
   //    // nftContract.isApprovedForAll(userData?.publicAddress, marketContract.ADDRESS);
   //    //    then(() => {
   //    //    })

   // }, [marketContract, nftContract])

   const handleSubmit = async (values: FormFields, { setSubmitting }: FormikHelpers<FormFields>) => {
      console.log("Details Received", values);
      if (!marketContract || !nftContract) { console.log("contract not found"); return }
      if (!userData?.publicAddress) { console.log("user publicAddress not found"); return }
      let { numberOfTokens, listingType, price, basePrice } = values;
      numberOfTokens = isAuctionAllowed ? "1" : numberOfTokens;

      const hasApproval = await nftContract.isApprovedForAll(userData.publicAddress, marketContract.ADDRESS);
      if (!hasApproval) {
         const approveTx = await nftContract.setApprovalForAll(marketContract.ADDRESS);
         const approveTransactionReceipt = await approveTx?.wait();
         console.log("approveTransactionReceipt", approveTransactionReceipt)
      }

      let transaction: ContractTransaction | null = null;
      if (listingType === "FIXED_PRICED") {
         console.log("calling marketContract.sellNft")
         transaction = await marketContract.sellNft(Number(price), Number(numberOfTokens), assetId);
      } else if (listingType === "TIMED_AUCTION") {
         console.log("calling marketContract.createAuction")
         transaction = await marketContract.createAuction(Number(basePrice), assetId);
      }
      console.log("Transaction hash: ", transaction?.hash);

      const { data } = await listNftApi(transaction?.hash!);
      console.log("listNft_appsync ===>", data)

      const blockChainStatus = await checkBlockChainStatus(nftInfo.tokenId!, "LISTNFT");
      console.log("checkBlockChainStatus", blockChainStatus);

      const transactionReceipt = await transaction?.wait();
      console.log("Transaction completed: ", transactionReceipt);
      navigate(PAGES.ASSETS.path + "/" + nftInfo.tokenId, { state: { nftMeta, nftInfo, } });

   }

   const handleValidateForm = (values: FormFields) => {
      const error: { [P in keyof FormFields]?: string; } = {}
      if (values.listingType === "TIMED_AUCTION") {
         if (!values.basePrice) {
            error.basePrice = "Required";
         }
         // if (!values.durationInSecs || Number(values.durationInSecs) < Date.now()) {
         //    error.durationInSecs = "Required";
         // }
      }

      if (values.listingType === "FIXED_PRICED") {
         if (!values.price) {
            error.price = "Required";
         }
         if (!isAuctionAllowed && !values.numberOfTokens) {
            error.numberOfTokens = "Required";
         }
         if (Number(values.numberOfTokens) > Number(nftInfo?.amount || 0)) {
            error.numberOfTokens = "Insufficient tokens";
         }
      }
      return error
   }

   const listNftApi = async (transactionHash: string): Promise<GraphQLResult<{ listNft: NftListing }>> => {
      try {
         return await API.graphql({
            query: listNft,
            variables: { input: { tokenId: assetId.toString(), transactionHash } } as MutationListNftArgs
         }) as GraphQLResult<{ listNft: NftListing }>;
      } catch (error) {
         if ((error as any).errors[0].message === "Request failed with status code 401") {
            return await listNftApi(transactionHash);
         }
         console.log(error);
         throw error;
      }

   }

   return (
      <Formik
         initialValues={{ ...formInitialValues }}
         onSubmit={handleSubmit}
         validationSchema={formSchema}
         validate={handleValidateForm}
      >
         {({ isSubmitting, setFieldValue, handleChange, values }) => {
            return <Form id="form-list-item" className="form-border">

               <h5>Select method*</h5>
               <div className="de_tab tab_methods">
                  <ul className="de_nav">
                     <li
                        onClick={() => { setFieldValue("listingType", "FIXED_PRICED") }}
                        className={`${values.listingType === "FIXED_PRICED" ? "active" : ""}`}
                     >
                        <span>
                           <i className="fa fa-tag"></i>Fixed price
                        </span>
                     </li>
                     <li
                        title={isAuctionAllowed ? undefined : `Auction is only allowed on single token supply`}
                        onClick={() => { isAuctionAllowed && setFieldValue("listingType", "TIMED_AUCTION") }}
                        className={`${values.listingType === "TIMED_AUCTION" ? "active" : ""}`}
                     >
                        <span style={{ cursor: isAuctionAllowed ? undefined : "not-allowed", color: isAuctionAllowed ? undefined : "#ddd" }} >
                           <i className="fa fa-hourglass-1"></i>Timed auction
                        </span>
                     </li>
                  </ul>
               </div>
               <br />

               {values.listingType === "FIXED_PRICED" && <>
                  <h5>Price (in MATIC)*</h5>
                  <Input data-autoresize type='text' onChange={e => { filterNumber({ e, handleChange, include: ["."] }) }} name="price" className="form-control mb-1" />
               </>}
               {values.listingType === "TIMED_AUCTION" && <>
                  <h5>Base Price*</h5>
                  <Input data-autoresize type='text' onChange={e => { filterNumber({ e, handleChange, include: ["."] }) }} name="basePrice" className="form-control mb-1" />
               </>}
               <br />

               {values.listingType === "FIXED_PRICED" && !isAuctionAllowed && <>
                  <h5>Number Of Tokens*</h5>
                  <Input data-autoresize type='text' onChange={e => { filterNumber({ e, handleChange }) }} name="numberOfTokens" className="form-control mb-1" />
                  <p><b>Remaining: </b>{Number(nftInfo?.amount || 0) - (+values.numberOfTokens!)}</p>
               </>}
               {/* {values.listingType === "TIMED_AUCTION" && <>
                  <h5>Auction Duration*</h5>
                  <DurationInput setvalue={v => { setFieldValue("durationInSecs", v) }} />
                  <ErrorMessage name="durationInSecs" component="p" className="text-sm mt-0.5 ml-0.5 mb-0  text-error" />
               </>} */}
               <br />

               <Button type='submit' disabled={isSubmitting}  >
                  {isSubmitting && (<span className='mr-1' ><Spinner width={15} height={15} /></span>)}
                  {isSubmitting ? ("Processing...") : "Proceed"}
               </Button>
               {isSubmitting && submittingStatus && <p className='' ><b>Status:</b> {submittingStatus}</p>}
            </Form>
         }}
      </Formik>
   )
}

export default ListNftForm;


const filterNumber = ({ e, handleChange, include = [] }: {
   e: React.ChangeEvent<any>, handleChange: (e: React.ChangeEvent) => void, include?: string[],
}) => {
   const filterChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ...include];
   e.target.value = e.target.value.split('').filter((chr) => filterChars.includes(chr)).join('');
   handleChange(e)
}

const DurationInput: FC<{ setvalue?: (v: number) => void }> = ({ setvalue }) => {
   const [duration, setDuration] = useState(Date.now());
   const [hours, setHours] = useState("");
   const [mins, setMins] = useState("");
   const onchange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.name === "hours") {
         const value = e.target.value.replace(/[\D]*/g, "");
         setHours(value);
         let val = Number(value);
         setDuration(Date.now() + (val * 60 * 60 * 1000) + (Number(mins) * 60 * 1000));
      }
      if (e.target.name === "mins") {
         const value = e.target.value.replace(/[\D]*/g, "");
         setMins(value);
         let val = Number(value);
         // val = isNaN(val) ? 0 : val;
         setDuration(Date.now() + (Number(hours) * 60 * 60 * 1000) + (val * 60 * 1000));
      }
   }

   useEffect(() => {
      setvalue && setvalue(duration);
   }, [duration])

   return (
      <div className="border-2 border-gray-200 p-2 rounded-md mb-1 flex" >
         <div className="w-full p-0.5 px-1 border-r border-gray-700 flex" >
            <p className="mb-0 mr-1">Hrs</p>
            <input onChange={onchange} value={hours} name="hours" pattern="$[0-9]+^" className="outline-none w-full" type="number" />
         </div>
         <div className="w-full p-0.5 px-1 flex">
            <p className="mb-0 mr-1" >Mins</p>
            <input onChange={onchange} value={mins} name="mins" className="outline-none w-full" type="number" />
         </div>
      </div>
   )
}