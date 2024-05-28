import React, { Component, FC, useEffect, useState } from "react"
// import Footer from '../components/footer';
import { createGlobalStyle } from "styled-components"
import { APPSYNC_GRAPHQL, PAGES } from "../../../../../app-config"
import { useAppSelector } from "../../../../../redux/store"
import { Seo, Spinner } from "../../../../common"
import { RouteComponentProps, useParams } from "@reach/router"
import ListNftForm from './Form';
import { useAssetsParams } from '../../';
import { navigate } from "gatsby"
import { GraphQLResult, NFTmeta } from "../../../../../utils/global-types"
import axios, { AxiosError } from "axios"
import { API } from "aws-amplify"
import { getNftInfo } from "../../../../../graphql/queries"
import { Nft, QueryGetNftInfoArgs } from "../../../../../graphql/types"

const ListNft: FC<RouteComponentProps> = ({ location }) => {
  const { authState, userData } = useAppSelector((s) => s.userAuth);
  const { assetId } = useAssetsParams();
  const [loading, setLoading] = useState(false);
  const windowState = (location?.state as { nftInfo: Nft, nftMeta: NFTmeta } | undefined)
  // console.log(windowState)
  const [nftInfo, setNftInfo] = useState<Nft | undefined>(windowState?.nftInfo);
  const [nftMeta, setNftmeta] = useState<NFTmeta | undefined>(windowState?.nftMeta);
  const [isError, setIsError] = useState<GraphQLResult<any> | null>();
  const { nftContract } = useAppSelector(s => s.contract);
  // const [userNonListedTokenBalnace, setUserNonListedTokenBalance] = useState<number | null>(null);


  const fetchNftInfo = async () => {
    setLoading(true)
    try {
      let data: { getNftInfo: Nft; } | undefined = undefined;
      if (!nftInfo) {
        data = (await API.graphql({
          query: getNftInfo,
          variables: { input: { tokenId: assetId }, } as QueryGetNftInfoArgs,
        },
          { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
        ) as GraphQLResult<{ getNftInfo: Nft }>).data;

        const userNonListedTokenBalnace = nftContract && userData?.publicAddress &&
          nftContract.balanceOf(userData.publicAddress, assetId);

        setNftInfo({ ...data?.getNftInfo, amount: userNonListedTokenBalnace?.toString() });
      }
      if (!nftMeta) {
        await fetchNftmetaFromIPFS(data?.getNftInfo.tokenUri || nftInfo?.tokenUri!)
      }
      setIsError(null)
      setLoading(false)
    } catch (error) {
      setIsError(error as any)
      setLoading(false)
      console.log("getCollectionInfo_Error", error)
    }
  }

  const fetchNftmetaFromIPFS = async (cid: string) => {
    try {
      // const { data } = await axios.get<NFTmeta>(`https://gateway.pinata.cloud/ipfs/${cid.replace("ipfs://", "")}`);
      const { data } = await axios.get<NFTmeta>(`https://gateway.moralisipfs.com/ipfs/${cid.replace("ipfs://", "")}`);
      setNftmeta(data);
    } catch (err) {
      const error: AxiosError = err as any;
      console.log("fetchNftmetaFromIPFS_Error", error.response?.data);
      // showDialog('error', error.response?.data, error.response?.data)
    }
  }

  useEffect(() => {
    fetchNftInfo()
  }, [])


  useEffect(() => {
    if (authState && authState === 'SIGNED_OUT') {
      navigate('/');
    }
    if (userData && !userData.isAdmin) {
      navigate("/");
    }

  }, [authState, userData])

  if (isNaN(Number(assetId))) {
    return <div>
      <h1 className="text-center mt-20">Invalid asset ID</h1>
    </div>
  }

  if (isError?.errors) {
    return <div >
      <h1 className="text-center mt-20" >{isError?.errors[0].message}</h1>
    </div>
  }

  return (
    <div>
      <Seo title={PAGES.ASSETS.routes.ITEM_DETAIL.routes.LIST_NFT.title} />
      <section
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${"https://gigaland.on3-step.com/img/background/subheader.jpg"})`,
        }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">List Item </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        {(!nftInfo?.tokenId || loading) ?
          <div className="text-center mt-20" >
            <Spinner />
          </div> :
          <div className="col-lg-7 offset-lg-1 mb-5">
            <ListNftForm assetId={Number(assetId)} nftInfo={nftInfo} nftMeta={nftMeta} />
          </div>
        }
      </section>
    </div>
  )
}

export default ListNft
// const CreateNft: FC<RouteComponentProps> = ({ }) => {
//   const [files, setfiles] = useState<{ files: any[] }>({ files: [] })
//   const [isActive, setisActive] = useState<boolean>(false)
//   const [listingType, setListingType] = useState<string>("FIXED")
//   const authState = useAppSelector(s => s.userAuth.authState)

//   useEffect(() => {
//     if (authState && authState === "SIGNED_OUT") {
//       console.log("data from create page without login")
//       navigate(-1)
//     }
//   }, [authState])

//   if (!authState || authState === "SIGNED_OUT" || authState === "PENDING") {
//     return (
//       <div>
//         <Seo title="Create NFT" />
//       </div>
//     )
//   }

//   const handleShow = () => {
//     document.getElementById("tab_opt_1")?.classList.add("show")
//     document.getElementById("tab_opt_1")?.classList.remove("hide")
//     document.getElementById("tab_opt_2")?.classList.remove("show")
//     document.getElementById("btn1")?.classList.add("active")
//     document.getElementById("btn2")?.classList.remove("active")
//     setListingType("FIXED")

//     // console.log("handle show text ----->",document.getElementById("btn1")?.innerText)
//   }

//   const handleShow1 = () => {
//     document.getElementById("tab_opt_1")?.classList.add("hide")
//     document.getElementById("tab_opt_1")?.classList.remove("show")
//     document.getElementById("tab_opt_2")?.classList.add("show")
//     document.getElementById("btn1")?.classList.remove("active")
//     document.getElementById("btn2")?.classList.add("active")
//     setListingType("AUCTION")
//     // console.log("handle show text ----->",document.getElementById("btn2")?.innerText)
//   }

//   const handleImage = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//     setFieldValue: (field: string, value: any) => void
//   ) => {
//     let img: any
//     // console.log(e?.target?.files[0])
//     if (e?.target && e?.target.files && e.target.files[0]) {
//       const img = await getBase64(e?.target?.files[0]);

//       console.log("from handle image handler", e.target.name);
//       // console.log(res)
//       // console.log(img)
//       setFieldValue(e.target.name, img)
//     }
//   }

//   return (
//     <div>
//       <Layout>
//         <Seo title={PAGES.ASSETS.routes.ITEM_DETAIL.routes.LIST_NFT.title} />
//         <GlobalStyles />
//         <section
//           className="jumbotron breadcumb no-bg"
//           style={{
//             backgroundImage: `url(${"https://gigaland.on3-step.com/img/background/subheader.jpg"})`,
//           }}
//         >
//           <div className="mainbreadcumb">
//             <div className="container">
//               <div className="row m-10-hor">
//                 <div className="col-12">
//                   <h1 className="text-center">Create </h1>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="container">
//           <div className="row">
//             <div className="col-lg-7 offset-lg-1 mb-5">
//               <Formik
//                 initialValues={{
//                   image: "",
//                   title: "",
//                   desc: "",
//                   price: "",
//                   royalty: "",
//                   minimumBid: "",
//                   startDate: "",
//                   endDate: ""
//                 }}
//                 validationSchema={validationSchema}
//                 onSubmit={(values, { setSubmitting, setErrors }) => {
//                   console.log("listingType ----->", listingType);
//                   if (listingType == "FIXED" && !values.price) {
//                     console.log("log when no price");
//                     setErrors({
//                       price: "price required"
//                     })
//                     setSubmitting(false)
//                   } else if (listingType == "AUCTION" && (!values.minimumBid || !values.startDate || !values.endDate)) {
//                     if (!values.minimumBid) {
//                       console.log("log when no minimum price");
//                       setErrors({
//                         minimumBid: "minimum bid price is required"
//                       })
//                     }
//                     else if (!values.startDate) {
//                       console.log("log when no start date");
//                       setErrors({
//                         startDate: "please enter auction start date"
//                       })
//                     }
//                     else if (!values.endDate) {
//                       console.log("log when no start date");
//                       setErrors({
//                         endDate: "please enter auction end date"
//                       })

//                     }

//                     setSubmitting(false)
//                   }
//                   else {
//                     console.log("all values enter suucess condition");
//                     setTimeout(() => {
//                       alert(JSON.stringify(values, null, 2))
//                       setSubmitting(false)
//                     }, 1000)
//                   }
//                 }}
//               >
//                 {({
//                   values,
//                   handleSubmit,
//                   handleChange,
//                   isSubmitting,
//                   setFieldValue,
//                 }) => (
//                   <Form
//                     id="form-create-item"
//                     className="form-border"
//                     onSubmit={handleSubmit}
//                   >
//                     <div className="field-set">
//                       <h5>Upload file</h5>
//                       <label
//                         htmlFor="image"
//                         className="block w-96 h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
//                       >
//                         {values.image ? (
//                           <img
//                             src={values.image}
//                             className="w-96 h-64 p-0.5 rounded-lg relative overflow-y-hidden"
//                           />
//                         ) : (
//                           <p className="text-center inline-flex items-center h-full w-full justify-center">
//                             PNG, JPG, GIF, WEBP or MP4. Max 200mb.
//                           </p>
//                         )}
//                         <input
//                           type="file"
//                           accept="image/*"
//                           id="image"
//                           name="image"
//                           style={{ display: "none" }}
//                           onChange={e => {
//                             handleImage(e, setFieldValue)
//                           }}
//                         />
//                       </label>

//                       <div className="spacer-single"></div>

//                       <h5>Select method</h5>
//                       <div className="de_tab tab_methods">
//                         <ul className="de_nav">
//                           <li id="btn1" className="active" onClick={handleShow}>
//                             <span>
//                               <i className="fa fa-tag"></i>Fixed price
//                             </span>
//                           </li>
//                           <li id="btn2" onClick={handleShow1}>
//                             <span>
//                               <i className="fa fa-hourglass-1"></i>Timed auction
//                             </span>
//                           </li>

//                         </ul>

//                         <div className="de_tab_content pt-3">
//                           <div id="tab_opt_1">
//                             <h5>Price</h5>
//                             <Input
//                               type="text"
//                               name="price"
//                               id="item_price"
//                               className="form-control"
//                               placeholder="enter price for one item (ETH)"
//                             />
//                           </div>

//                           <div id="tab_opt_2" className="hide">
//                             <h5>Minimum bid</h5>
//                             <Input
//                               type="text"
//                               name="minimumBid"
//                               id="item_price_bid"
//                               className="form-control"
//                               placeholder="enter minimum bid"
//                             />

//                             <div className="spacer-20"></div>

//                             <div className="row">
//                               <div className="col-md-6">
//                                 <h5>Starting date</h5>
//                                 <Input
//                                   type="date"
//                                   name="startDate"
//                                   id="bid_starting_date"
//                                   className="form-control"
//                                   min={new Date().toISOString().split('T')[0]}
//                                 />
//                               </div>
//                               <div className="col-md-6">
//                                 <h5>Expiration date</h5>
//                                 <Input
//                                   type="date"
//                                   name="endDate"
//                                   id="bid_expiration_date"
//                                   className="form-control"
//                                   min={new Date().toISOString().split('T')[0]}
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <h5>Title</h5>
//                       <Input
//                         type="text"
//                         name="title"
//                         id="item_title"
//                         className="form-control"
//                         placeholder="e.g. 'Crypto Funk"
//                       />

//                       <div className="spacer-10"></div>

//                       <h5>Description</h5>
//                       <Input
//                         data-autoresize
//                         name="desc"
//                         as="textarea"
//                         id="item_desc"
//                         className="form-control"
//                         placeholder="e.g. 'This is very limited item'"
//                       ></Input>

//                       <div className="spacer-10"></div>

//                       {/* <h5>Price</h5>
//                       <Input
//                         type="text"
//                         name="price"
//                         id="item_price"
//                         className="form-control"
//                         placeholder="enter price for one item (ETH)"
//                       />

//                       <div className="spacer-10"></div> */}

//                       <h5>Royalties</h5>
//                       <Input
//                         type="number"
//                         name="royalty"
//                         id="item_royalties"
//                         className="form-control"
//                         placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%"
//                       />

//                       <div className="spacer-10"></div>

//                       <Button
//                         type="submit"
//                         // id="submit"
//                         disabled={isSubmitting ? true : false}
//                         className="btn-main"
//                       >
//                         Create Item
//                         {isSubmitting && (
//                           <span>
//                             <Spinner width={15} height={15} color="primary" />
//                           </span>
//                         )}
//                       </Button>

//                     </div>
//                   </Form>
//                 )}
//               </Formik>

//             </div>

//             <div className="col-lg-3 col-sm-6 col-xs-12">
//               <h5>Preview item</h5>
//               <div className="nft__item m-0">
//                 <div className="de_countdown">
//                   <Clock
//                   // deadline="December, 30, 2021"
//                   />
//                 </div>
//                 <div className="author_list_pp">
//                   <span>
//                     <img
//                       className="lazy"
//                       src="	https://gigaland.on3-step.com/img/author/author-1.jpg"
//                       alt=""
//                     />
//                     <i className="fa fa-check"></i>
//                   </span>
//                 </div>
//                 <div className="nft__item_wrap">
//                   <span>
//                     <img
//                       src="https://gigaland.on3-step.com/img/collections/coll-item-3.jpg"
//                       id="get_file_2"
//                       className="lazy nft__item_preview"
//                       alt=""
//                     />
//                   </span>
//                 </div>
//                 <div className="nft__item_info">
//                   <span>
//                     <h4>Pinky Ocean</h4>
//                   </span>
//                   <div className="nft__item_price">
//                     0.08 ETH<span>1/20</span>
//                   </div>
//                   <div className="nft__item_action">
//                     <span>Place a bid</span>
//                   </div>
//                   <div className="nft__item_like">
//                     <i className="fa fa-heart"></i>
//                     <span>50</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* <Footer /> */}
//       </Layout>
//     </div>
//   )
// }
// // }

// export default CreateNft

// const validationSchema = Yup.object().shape({
//   desc: Yup.string().min(10).max(500).nullable().optional(),
//   title: Yup.string().min(5).max(50).nullable().required('Required'),
//   price: Yup.number().positive().optional(),
//   minimumBid:Yup.number().positive().optional(),
//   royalty:Yup.number().positive().required('Required'),
// })