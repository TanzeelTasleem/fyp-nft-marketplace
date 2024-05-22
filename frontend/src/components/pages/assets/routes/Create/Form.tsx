import React, { FC, useCallback, useRef, useState } from "react"
import { Form, FieldArray, Formik, FieldArrayRenderProps, FormikHelpers, } from "formik"
import Input from "../../../../common/Input"
import * as Yup from "yup"
import { Button, Spinner } from "../../../../common"
import { Collection, MutationMintNftArgs, Nft, QuerySearchCollectionByNameArgs, GetCollectionsOutput, } from "../../../../../graphql/types"
import { uploadFileToS3, getFileFromS3, delay, checkBlockChainStatus, } from "../../../../../utils/helper"
import { mintNft } from "../../../../../graphql/mutations"
import { collectionIdAvailable, getBlockChainStatus, searchCollectionByName, } from "../../../../../graphql/queries"
import { GraphQLResult, NFTmeta } from "../../../../../utils/global-types"
import { API } from "aws-amplify"
import { navigate } from "gatsby-link"
import { PAGES } from "../../../../../app-config"
import { useAppSelector } from "../../../../../redux/store"
import { APPSYNC_GRAPHQL } from "../../../../../app-config"
import axios from "axios"
import { Pinata } from "../../../../../utils/pinata-service"
import useOnclickOutside from "react-cool-onclickoutside"
import { uploadToS3 } from '../../../../../utils/s3-service';

const formSchema = Yup.object({
    name: Yup.string().required("Required"),
    collectionName: Yup.string().required("Required"),
    description: Yup.string().required("Required"),
    totalSupply: Yup.string().required("Required"),
})

export interface FormFields extends Yup.InferType<typeof formSchema> { }

let formInitialValues: FormFields = {
    name: "",
    collectionName: "",
    description: "",
    totalSupply: "",
}

// const handleValidateForm = (values: FormFields) => {
//     const error: { [P in keyof FormFields]?: string; } = {}
//     // if (values.id) {
//     //     return error.id
//     // }
//     return error
// }

interface Props {
    collectionInfo?: Collection
}
const CreateNFTForm: FC<Props> = ({ collectionInfo }) => {
    const [nftImage, setNftImage] = useState<File>()
    const nftContract = useAppSelector(s => s.contract.nftContract)
    const [submittingStatus, setSubmittingStatus] = useState<string | null>(null)
    const [showOptions, setShowOptions] = useState(false)
    const [loading, setLoading] = useState(false)
    const [after, setAfter] = useState<string[] | undefined>(undefined)
    const [hasMore, sethasMore] = useState(false)
    const observer = useRef<any | null>(null)
    const [value, setValue] = useState<string>("")
    const [collectionsNames, setCollectionsNames] = useState<{ searchCollectionByName: GetCollectionsOutput } | null>(null);

    const handleSubmit = async (values: FormFields, { setSubmitting }: FormikHelpers<FormFields>) => {
        console.log("Details Received", values)
        if (!nftContract) { console.log("contract not found"); return }
        if (!nftImage) { console.log("nftImage not found"); return }
        // const imgUploadRes = await handleUploadImage(values.id, nftImage, "logo"),

        const collectionId = collectionInfo?.id ||
            collectionsNames?.searchCollectionByName.collections.filter(v => v.name === values.collectionName)[0].id;
        if (!collectionId) { throw new Error("collectionId not found") }

        console.log("collectionId", collectionId);

        try {
            const assetName = `${values.name.toLowerCase().replace(/ /g, "-")}.${nftImage.name.split(".").slice(-1)}`;
            const pinata = new Pinata({
                pinata_api_key: process.env.PINATA_API_KEY!,
                pinata_secret_api_key: process.env.PINATA_API_SECRET!,
            })

            setSubmittingStatus("Pinning file to IPFS")
            const pinFileToIPFS = await pinata.pinFileToIPFS(nftImage, assetName)
            console.log("pin file data ==>", pinFileToIPFS)

            setSubmittingStatus("Uploading file to S3")
            // const { key: nftImgS3Key } = await handleUploadImage(collectionId, nftImage, assetName, nftImage.type);
            const nftImgS3Key = await uploadToS3({ file: nftImage, filePath: `nft/${assetName}/profile` });

            setSubmittingStatus("Pinning file Meta to IPFS")
            const nftMeta: NFTmeta = {
                description: values.description,
                image: `ipfs://${pinFileToIPFS.IpfsHash}`,
                name: values.name,
            }
            const pinJSONToIPFS = await pinata.pinJSONToIPFS(nftMeta);
            console.log("pin json data ==>", pinJSONToIPFS);
            const nftmetaIpfsLink = "ipfs://" + pinJSONToIPFS.IpfsHash;

            setSubmittingStatus("Minting in smart contract");
            const transaction = await nftContract.mintNFT(Number(values.totalSupply), collectionId, nftmetaIpfsLink);
            console.log("Transaction hash: ", transaction.hash);

            setSubmittingStatus("Getting collection ref");
            const { data: { getCollectionInfo }, } = (await API.graphql({
                query: `query MyQuery {  getCollectionInfo(input: {id: "${collectionId}"}) {ref id} }`,
            },
                { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
            )) as any

            // console.log("getCollectionInfo", getCollectionInfo)
            // console.log("nftImage", nftImage)

            setSubmittingStatus("Updating NFT details in the cloud")
            const { data } = await mintNftApi({
                input: { collectionId: collectionId, collectionRef: getCollectionInfo.ref, transactionhash: transaction.hash, imageUrl: nftImgS3Key, }
            })
            console.log("mintNft_appsync ===>", data)

            setSubmittingStatus("Polling for mint confirmation in the Blockchain");
            const blockChainStatus = await checkBlockChainStatus(transaction.hash, "MINTNFT");

            console.log("checkBlockChainStatus", blockChainStatus);
            // console.log("createCollection", data);
            const transactionReceipt = await transaction.wait();
            console.log("Transaction completed: ", transactionReceipt);
            navigate(PAGES.ASSETS.path + "/" + blockChainStatus?.data, {
                state: {
                    nftMeta,
                    nftInfo: {
                        ...(data?.mintNft!), tokenId: blockChainStatus?.data!,
                        totalSupply: Number(values.totalSupply), tokenUri: nftmetaIpfsLink!,
                    } as Nft,
                },
            });
        } catch (error) {
            console.log("mintNft_error", error);
            setSubmitting(false);
            setSubmittingStatus(null);
        }
    }

    const mintNftApi = async (variables: MutationMintNftArgs): Promise<GraphQLResult<{ mintNft: Nft }>> => {
        try {
            return await API.graphql({ query: mintNft, variables, }) as GraphQLResult<{ mintNft: Nft }>
        } catch (error) {
            if ((error as any).errors[0].message === "Request failed with status code 401") {
                console.log("401 error occured in mintNft, recalling again");
                return await mintNftApi(variables);
            }
            console.log("mintNft_Error", error);
            throw error;
        }

    }

    // const handleUploadImage = async (collectionId: string, file: File, assetIdentifier: string, contentType: string) => {
    //     // if (!e.target?.files) { console.log("No file found"); return }
    //     return await uploadFileToS3(file, `collections/${collectionId}/${assetIdentifier}`, { contentType: "image/webp" })
    // }

    const searchCollectionName = async (value: string) => {
        // console.log("searchCollectionName value", value);
        setLoading(true)
        if (!value) {
            setCollectionsNames(null)
            setLoading(false)
            return
        }
        try {
            const { data } = (await API.graphql({
                query: searchCollectionByName,
                variables: {
                    input: { name: value, pageSize: 20, after: after, },
                } as QuerySearchCollectionByNameArgs,
            },
                { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
            )) as GraphQLResult<{ searchCollectionByName: GetCollectionsOutput }>
            setLoading(false)
            // console.log("searchCollectionByName", data)
            if (data?.searchCollectionByName) {
                setCollectionsNames({ searchCollectionByName: data?.searchCollectionByName, })
            }
            data?.searchCollectionByName.after?.length && sethasMore(true)
            // setAfter(collectionsNames?.searchCollectionByName.after)
        } catch (error) {
            setLoading(false)
            console.log("searchCollectionByNameError ---->", error)
        }
    }

    return (
        <Formik
            initialValues={{ ...formInitialValues, collectionName: collectionInfo?.name || "" }}
            onSubmit={handleSubmit}
            validationSchema={formSchema}
        // validate={handleValidateForm}
        >
            {({ isSubmitting, handleChange, handleBlur, setFieldValue, values }) => {

                const handleNameChange = async e => {
                    handleChange(e)
                    //   console.log("form values --->", e.target.value)
                    await searchCollectionName(e.target.value as string)
                }

                const handleClickOutsideCollectionField = useOnclickOutside(() => {
                    setShowOptions(false) // setCollectionsNames(null)
                })

                const handleCollectionItemClick = (collection: Collection) => {
                    setFieldValue("collectionName", collection.name)
                    setShowOptions(false)
                }

                return (
                    <Form id="form-create-item" className="form-border">

                        <FileInput nftImage={nftImage} setNftImage={setNftImage} />

                        <div className="spacer-20"></div>

                        <div ref={handleClickOutsideCollectionField}>
                            <h5>Collection*</h5>
                            <Input
                                type="text"
                                name="collectionName"
                                autoComplete="off"
                                className="form-control mb-1"
                                onChange={handleNameChange}
                                onFocus={() => { setShowOptions(true) }}
                            />
                            {showOptions && values.collectionName && (
                                <div className="w-full max-h-40 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white rounded-lg shadow">
                                    <ul className="divide-y-2 m-0 p-0 divide-gray-100">
                                        {collectionsNames?.searchCollectionByName.collections.map(
                                            (collection, index) => (
                                                <li
                                                    key={index}
                                                    className="px-1.5 py-2 m-0 cursor-pointer"
                                                    onClick={() => {
                                                        handleCollectionItemClick(collection)
                                                    }}
                                                >
                                                    {collection.name}
                                                </li>
                                            )
                                        )}
                                        {loading && (
                                            <li className="px-1.5 py-2 m-0 cursor-pointer flex items-center ">
                                                <Spinner width={15} height={15} color="primary" />
                                                <span className="pl-1.5">loading...</span>
                                            </li>
                                        )}
                                        {!loading &&
                                            !collectionsNames?.searchCollectionByName?.collections
                                                ?.length &&
                                            collectionsNames !== null && (
                                                <li className="px-1.5 py-2 m-0 cursor-pointer flex items-center ">
                                                    <span className="pl-1.5 capitalize">
                                                        no collection found with this name
                                                    </span>
                                                </li>
                                            )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <br />
                        <h5>Name*</h5>
                        <Input type="text" name="name" className="form-control mb-1" />
                        <br />

                        <h5>Description*</h5>
                        <Input
                            data-autoresize
                            name="description"
                            as="textarea"
                            className="form-control mb-1"
                            placeholder="e.g. 'This is very limited item'"
                        />
                        <br />

                        <h5>Total Supply*</h5>
                        <Input
                            data-autoresize
                            onChange={e => {
                                filterNumber({ e, handleChange })
                            }}
                            name="totalSupply"
                            className="form-control mb-1"
                        />
                        <br />

                        <br />

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <span className="mr-1">
                                    <Spinner width={15} height={15} />
                                </span>
                            )}
                            {isSubmitting ? "Minting..." : "Create"}
                        </Button>
                        {isSubmitting && submittingStatus && (
                            <p className="">
                                <b>Status:</b> {submittingStatus}
                            </p>
                        )}
                    </Form>
                )
            }}
        </Formik>
    )
}

export default CreateNFTForm

const filterNumber = ({ e, handleChange, include = [] }: {
    e: React.ChangeEvent<any>; handleChange: (e: React.ChangeEvent) => void; include?: string[]
}) => {
    const filterChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ...include,]
    e.target.value = e.target.value.split("").filter(chr => filterChars.includes(chr)).join("")
    handleChange(e)
}



const _FileInput: FC<{ nftImage, setNftImage }> = ({ nftImage, setNftImage }) => {
    return (<div className="field-set">
        <h5>Upload file</h5>
        <label
            // style={{ height: nftImage ? undefined : "16rem" }}
            htmlFor="nftImage"
            className="block border-2 p-0.5 w-full h-[220px] border-gray-300 border-dashed rounded-lg cursor-pointer"
        >
            {nftImage ? (
                <div
                    // <img
                    style={{ backgroundImage: `url(${URL.createObjectURL(nftImage)})` }}
                    // src={URL.createObjectURL(nftImage)}
                    className="w-full h-full rounded-lg bg-center bg-no-repeat bg-contain"
                />
            ) : (
                <p className="text-center inline-flex items-center h-full w-full justify-center p-2">
                    PNG, JPG, GIF, WEBP or MP4. Max 200mb.
                </p>
            )}
            <input type="file" accept="image/*" id="nftImage" name="nftImage" style={{ display: "none" }}
                onChange={e => {
                    e?.target?.files &&
                        e.target.files[0] &&
                        setNftImage(e.target.files[0])
                }}
            />
        </label>
    </div>)
}
const FileInput = React.memo(_FileInput);