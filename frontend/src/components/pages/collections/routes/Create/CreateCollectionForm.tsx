import React, { FC, useEffect, useState } from 'react';
import { Form, FieldArray, Formik, FieldArrayRenderProps, FormikHelpers } from "formik";
import Input from "../../../../common/Input";
import * as Yup from 'yup';
import { Button, Spinner } from '../../../../common';
import { Category, MutationCreateCollectionArgs, Collection, BlockChainStatus_Type, RoyaltyInfoInput, QueryGetBlockChainStatusArgs, BlockChainStatus } from '../../../../../graphql/types';
import { uploadFileToS3, getFileFromS3, delay, checkBlockChainStatus } from '../../../../../utils/helper';
import { createCollection } from '../../../../../graphql/mutations';
import { collectionIdAvailable, getBlockChainStatus } from '../../../../../graphql/queries';
import { GraphQLResult } from '../../../../../utils/global-types';
import { API } from 'aws-amplify';
import { navigate } from 'gatsby-link';
import { PAGES } from '../../../../../app-config';
import { useAppSelector } from '../../../../../redux/store';
import { uploadToS3 } from '../../../../../utils/s3-service';


const formSchema = Yup.object({
    id: Yup.string()
        .min(4, "Collection ID must be atleast 4 characters")
        .max(24, "Collection ID cannot be greater than 24 characters")
        .matches(/^(\S+$)/, 'Collection ID cannnot include whitespaces')
        .required("Required"),
    name: Yup.string().required("Required"),
    description: Yup.string().required("Required"),
    // profileImage: Yup.string(),
    // coverImage: Yup.string(),
    royaltyInfo: Yup.array(
        Yup.object({
            address: Yup.string().matches(/^0x[a-fA-F0-9]{40}$/g, "invalid wallet address").required("Required"),
            percentage: Yup.string().required("Required"),
        })
    ).min(1).required("Required"),
    category: Yup.string().required("Required"),
})

export interface FormFields extends Yup.InferType<typeof formSchema> { }

let formInitialValues: FormFields = {
    id: "",
    name: "",
    category: "",
    // coverImage: "",
    // profileImage: "",
    description: "",
    royaltyInfo: [{ address: "", percentage: "" }]
};

const handleValidateForm = (values: FormFields) => {
    const error: { [P in keyof FormFields]?: string; } = {}
    // if (values.id) {
    //     return error.id
    // }
    return error
}

const CreateCollectionForm: FC = ({ }) => {
    const [profileImage, setProfileImage] = useState<File>();
    const [coverImage, setCoverImage] = useState<File>();
    const [isCollectionIdAvailable, setCollectionIdAvailable] = useState<"checking" | boolean | null>(null);
    const nftContract = useAppSelector(s => s.contract.nftContract);

    // console.log(profileImage);

    // useEffect(() => {
    //     (async () => {
    //         const res = await getFileFromS3("collections/logo/demo-1.webp");
    //         console.log("getFileFromS3 ===>", res);
    //     })()
    // }, [])

    const handleCheckCollectionIdAvailable = (handleChange, fieldError: string) => async (e) => {
        handleChange(e);
        if (e.target.value.length > 3 && fieldError !== "Collection ID cannot be greater than 24 characters") {
            setCollectionIdAvailable("checking");
            try {
                const { data } = await API.graphql({
                    query: collectionIdAvailable,
                    variables: { id: e.target.value, },
                }) as GraphQLResult<{ collectionIdAvailable: boolean }>;
                setCollectionIdAvailable(data?.collectionIdAvailable!)
                // data && setFieldError("id", "This collection ID is already in use. Please try a different one");
            } catch (error) { setCollectionIdAvailable(null); console.log("collectionIdAvailable_ERROR", error) }
        } else { setCollectionIdAvailable(null); }
    }

    const handleSubmit = async (values: FormFields, { setSubmitting }: FormikHelpers<FormFields>) => {
        console.log("Details Received", values);
        if (!nftContract) { console.log("contract not found"); return }
        // const imgUploadRes = await Promise.all([
        //     profileImage && handleUploadImage(values.id, profileImage, "logo"),
        //     coverImage && handleUploadImage(values.id, coverImage, "cover"),
        // ])
        const imgUploadRes = await Promise.all([
            profileImage && uploadToS3({ file: profileImage, filePath: `collection/${values.id}/profile` }),
            coverImage && uploadToS3({ file: coverImage, filePath: `collection/${values.id}/cover` }),
        ])

        console.log("imgUploadRes", imgUploadRes);
        // return

        try {
            const transaction = await nftContract.createCollection(
                values.id,
                values.name,
                values.royaltyInfo.map(v => v.address),
                values.royaltyInfo.map(v => Number(v.percentage))
            );

            console.log("Transaction hash: ", transaction.hash);

            const { data } = await API.graphql({
                query: createCollection,
                variables: {
                    input: {
                        category: values.category,
                        profileImage: imgUploadRes[0] && atob(imgUploadRes[0]),
                        coverImage: imgUploadRes[1] && atob(imgUploadRes[1]),
                        description: values.description,
                        id: values.id,
                        name: values.name,
                        royalityInfo: values.royaltyInfo as any as RoyaltyInfoInput[],
                        transactionhash: transaction.hash
                    }
                } as MutationCreateCollectionArgs,
            }) as GraphQLResult<{ createCollection: Collection }>;

            const CollectionBlockChainStatus = await checkBlockChainStatus(values.id, "COLLECTION")

            console.log("CollectionBlockChainStatus", CollectionBlockChainStatus);
            console.log("createCollection", data);
            const transactionReceipt = await transaction.wait();
            console.log("Transaction completed: ", transactionReceipt);
            navigate(PAGES.COLLECTIONS.path + "/" + data?.createCollection.id);



        } catch (error) {
            console.log("createCollection_error", error);
            setSubmitting(false);
        }

    }

    // const handleUploadImage = async (collectionId: string, file: File, type: "cover" | "logo") => {
    //     // if (!e.target?.files) { console.log("No file found"); return }
    //     return await uploadFileToS3(file, `collections/${collectionId}/${type}.webp`, { contentType: "image/webp" });
    // }

    return (
        <Formik
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            validationSchema={formSchema}
            validate={handleValidateForm}
        >
            {({ isSubmitting, handleChange, values, errors }) => {

                const totalRoyalty = values.royaltyInfo.map(v => Number(v.percentage || 0)).reduce((s, a) => s + a, 0);

                const handleAddRoyaltyHolder = (arrayHelpers: FieldArrayRenderProps, index: number) => () => {
                    arrayHelpers.insert(index, { address: "", percentage: "" })
                }
                const handleRemoveRoyaltyHolder = (arrayHelpers: FieldArrayRenderProps, index: number) => () => {
                    (values.royaltyInfo.length === 1) && arrayHelpers.insert(index + 1, { address: "", percentage: "" });
                    arrayHelpers.remove(index)
                }

                return <Form id="form-create-item" className="form-border">

                    <h5>Logo Image</h5>

                    <label
                        htmlFor="logoImage"
                        className="block border-dashed border-[3px] p-0.5  border-gray-300"
                        style={{ cursor: "pointer", width: "110px", height: "110px", borderRadius: "50%", }}                    >
                        {profileImage && (
                            <img
                                src={profileImage && URL.createObjectURL(profileImage)}
                                className="pb-0.5 inline object-cover overflow-hidden hover:shadow-lg"
                                style={{ cursor: "pointer", padding: "0px", margin: "0px", borderRadius: "50%", width: "100px", height: "100px", }}
                            />
                        )}
                        <input type="file" accept="image/*" id="logoImage" name="logoImage" style={{ display: "none" }} onChange={e => { e?.target?.files && e.target.files[0] && setProfileImage(e.target.files[0]) }} />
                    </label>

                    <div className="spacer-single"></div>
                    <h5>Cover Image</h5>
                    <label
                        style={{ height: (coverImage) ? undefined : "12rem" }}
                        htmlFor="coverImage"
                        className="block w-[300px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
                    >
                        {coverImage ? (
                            <img
                                src={coverImage && URL.createObjectURL(coverImage)}
                                className="w-[300px] p-0.5 rounded-lg relative overflow-y-hidden"
                                alt=""
                            />
                        ) : (
                            <p className="text-center inline-flex items-center h-full w-full justify-center">
                                PNG, JPG, GIF, WEBP or MP4. Max 200mb.
                            </p>
                        )}

                        <input id="coverImage" name="coverImage" type="file" style={{ display: "none" }} onChange={e => { e?.target?.files && e.target.files[0] && setCoverImage(e.target.files[0]) }} />
                    </label>

                    <div className="spacer-single"></div>

                    <div className="spacer-20"></div>

                    <h5>Collection ID*</h5>
                    <Input onChange={handleCheckCollectionIdAvailable(handleChange, errors.id || "")} type="text" name="id" className="form-control mb-1" placeholder="This is the unique identifier will be use as a slug" />
                    {!errors.id && isCollectionIdAvailable === true ?
                        < p className='text-sm mt-0.5 ml-0.5  text-success'>This collection ID is available</p> :

                        !errors.id && isCollectionIdAvailable === false ?
                            < p className='text-sm mt-0.5 ml-0.5  text-error'>This collection ID is already in use. Please try a different one</p> :

                            !errors.id && isCollectionIdAvailable === "checking" ?
                                <div className='mt-2 flex items-center' >
                                    <span><Spinner width={20} height={20} /></span>
                                    <span className='text-sm ml-1  text-gray-600'>Checking collection ID availability</span>
                                </div> :
                                null
                    }
                    <br />

                    <h5>Collection Name*</h5>
                    <Input type="text" name="name" className="form-control mb-1" placeholder="e.g. 'Crypto Funk" />
                    <br />

                    <h5>Category*</h5>
                    <Input name="category" as="select" value={values.category} onChange={handleChange} className="form-select mb-1">
                        {["", ...Object.values(Category)].map((v, idx) => <option key={idx} value={v} >{v}</option>)}
                    </Input>
                    <br />

                    <h5>Description*</h5>
                    <Input data-autoresize name="description" as="textarea" className="form-control mb-1" placeholder="e.g. 'This is very limited item'" />
                    <br />

                    <FieldArray
                        name="royaltyInfo"
                        render={arrayHelpers => (
                            <>
                                <h5 className='my-3' >
                                    Royalty Distribution
                                    <span aria-hidden="true"
                                        onClick={handleAddRoyaltyHolder(arrayHelpers, values.royaltyInfo.length)}
                                        className="icon_plus_alt2 cursor-pointer float-right text-2xl"
                                        title='Add royalty holder'
                                    />
                                </h5>
                                <div style={{ backgroundColor: totalRoyalty > 10 ? "#ff000018" : undefined }} className='py-3 rounded-md border-1 border-solid space-y-3' >
                                    {values.royaltyInfo.map((_, index) => {
                                        const className = "w-full"
                                        return <div key={index} className='flex group w-full px-3'>
                                            <div className={className} >
                                                <Input className='form-control mb-1' type='text' name={`royaltyInfo[${index}].address`} placeholder="Wallet Address" />
                                            </div>
                                            <div className={`${className} ml-3`} >
                                                <Input className='form-control mb-1' onChange={(e) => { filterNumber({ e, handleChange }) }} type='text' name={`royaltyInfo[${index}].percentage`} placeholder="Percentage" />
                                            </div>
                                            <div className='translate-x-2 translate-y-2' >
                                                <span
                                                    onClick={handleRemoveRoyaltyHolder(arrayHelpers, index)}
                                                    className="text-red-700 hidden group-hover:block absolute icon_minus_alt2 cursor-pointer float-right text-2xl"
                                                    title='remove royalty holder'
                                                />
                                            </div>
                                        </div>
                                    })}

                                    <div className='w-full px-3 mt-4' >
                                        <div className='text-gray-500 text-lg' >
                                            Number of royalty holders: {values.royaltyInfo.length}
                                        </div>
                                        <div className='text-gray-500  text-lg'>
                                            Total royalty distributed: {totalRoyalty}%
                                        </div>
                                        <div className='text-error' >{totalRoyalty > 10 ? "Total royalty must not be greater than 10%." : ""}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    />
                    <br />

                    <br />

                    <Button disabled={isSubmitting || totalRoyalty > 10} type='submit'  >
                        {isSubmitting && (<span className='mr-1' ><Spinner width={15} height={15} /></span>)}
                        {isSubmitting ? "Creating" : "Create"}
                    </Button>
                </Form>
            }}
        </Formik >
    )
}

export default CreateCollectionForm;


const filterNumber = ({ e, handleChange, include = [] }: {
    e: React.ChangeEvent<any>, handleChange: (e: React.ChangeEvent) => void, include?: string[],
}) => {
    const filterChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ...include];
    e.target.value = e.target.value.split('').filter((chr) => filterChars.includes(chr)).join('');
    handleChange(e)
}
