import { Formik, Form, FormikHelpers } from "formik"
import React, { useEffect, useState } from "react"
import * as Yup from "yup"
import { APPSYNC_GRAPHQL, PAGES, S3_BUCKET } from "../../../../../../app-config"
import { delay, shallowDiffReturn, shallowEqual, uploadFileToS3, uuid } from "../../../../../../utils/helper"
import { useParams } from "@reach/router"
import { API } from "aws-amplify"
import { getCollectionInfo } from "../../../../../../graphql/queries"
import { Category, Collection, MutationUpdateCollectionArgs, QueryGetCollectionInfoArgs } from "../../../../../../graphql/types"
import { GraphQLResult } from "@aws-amplify/api-graphql"
import { Button, Spinner } from "../../../../../common"
import Input from "../../../../../common/Input"
import { updateCollection } from "../../../../../../graphql/mutations"
import { useAppSelector } from "../../../../../../redux/store"
import { navigate } from "gatsby"
import { uploadToS3 } from '../../../../../../utils/s3-service';

const formSchema = Yup.object({
  name: Yup.string().required("Required"),
  description: Yup.string().required("Required"),
  profileImage: Yup.string(),
  coverImage: Yup.string(),
  category: Yup.string().required("Required"),
})

export interface FormFields extends Yup.InferType<typeof formSchema> { }

let formInitialValues: FormFields = {
  name: "",
  category: "",
  coverImage: "",
  profileImage: "",
  description: "",
}

const handleValidateForm = (values: FormFields) => {
  const error: { [P in keyof FormFields]?: string; } = {}
  return error
}

const UpdateCollectionForm = () => {
  const { CollectionId } = useParams();
  console.log("collection id", CollectionId);
  const { alerts: { showDialog }, userAuth: { userData } } = useAppSelector(s => s)
  const [loading, setLoading] = useState(false)
  const [isDisable, setIsDisable] = useState(true);
  const [isError, setIsError] = useState<GraphQLResult<any> | null>();
  const [profileImage, setProfileImage] = useState<File>();
  const [coverImage, setCoverImage] = useState<File>();
  const [collectionInfo, setCollectionInfo] = useState<Collection>()

  const fetchCollectionInfo = async () => {
    setLoading(true)
    try {
      const { data } = (await API.graphql(
        {
          query: getCollectionInfo,
          variables: {
            input: {
              id: CollectionId,
            },
          } as QueryGetCollectionInfoArgs,
        },
        { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
      )) as GraphQLResult<{ getCollectionInfo: Collection }>
      setCollectionInfo(data?.getCollectionInfo);
      if (data?.getCollectionInfo) {
        const { name, category, coverImage, profileImage, description }: any = data.getCollectionInfo
        formInitialValues = {
          ...formInitialValues,
          name,
          category,
          coverImage,
          profileImage,
          description
        }
      }
      setLoading(false)
    } catch (error) {
      setLoading(false);
      setIsError(error as any)
      console.log("getCollectionInfo_Error", error)
    }
  }
  useEffect(() => {
    (async () => {
      await fetchCollectionInfo()
    })()
  }, [CollectionId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "logoImage") {
      if (e?.target && e?.target.files) {
        setProfileImage(e.target.files[0])
        setIsDisable(false)
      }
    }
    if (e?.target.name === "coverImage") {
      if (e?.target && e?.target.files) {
        setCoverImage(e.target.files[0])
        setIsDisable(false)
      }
    }
  }

  useEffect(() => {
    (async () => {
      await fetchCollectionInfo()
    })()
  }, [CollectionId])

  const handleSubmit = async (values: FormFields, { setSubmitting }: FormikHelpers<FormFields>) => {
    const imgUploadRes = await Promise.all([
      profileImage && uploadToS3({ file: profileImage, filePath: `collection/${CollectionId}/profile` }),
      coverImage && uploadToS3({ file: coverImage, filePath: `collection/${CollectionId}/cover` }),
    ])
    // const imgUploadRes = await Promise.all([
    //   profileImage && handleUploadImage(collectionInfo?.id!, profileImage, "logo"),
    //   coverImage && handleUploadImage(collectionInfo?.id!, coverImage, "cover"),
    // ])
    const diff = shallowDiffReturn(formInitialValues, {
      values,
      ...(imgUploadRes[0] && { profileImage: imgUploadRes[0] }),
      ...(imgUploadRes[1] && { coverImage: imgUploadRes[1] }),
    });
    console.log("difference values", diff);
    if (Object.keys(diff).length) {
      console.log("FROM difference condition satisfied");
      try {
        const { data } = (await API.graphql(
          {
            query: updateCollection,
            variables: {
              input: {
                ref: collectionInfo?.ref,
                ...(imgUploadRes[0] && { profileImage: atob(imgUploadRes[0]) }),
                ...(imgUploadRes[1] && { coverImage: atob(imgUploadRes[1]) }),
                ...diff
              },
            } as MutationUpdateCollectionArgs,
          },
        )) as GraphQLResult<{ updateCollection: Collection }>
        setSubmitting(false);
        navigate(`${PAGES.COLLECTIONS.path}/${CollectionId}`)
      } catch (error: any) {
        showDialog("error", "error in updating collection info", error.errors![0].message)
        setSubmitting(false)
      }
    } else if (profileImage || coverImage) {
      console.log("from else if --->", "profileImage --->", profileImage, "coverImage --->", coverImage);
      setSubmitting(false);
      navigate(`${PAGES.COLLECTIONS.path}/${CollectionId}`)
    }
  }

  return (
    <>
      {
        loading && (
          <div className="flex justify-center w-full items-center space-x-2">
            <span>
              <Spinner width={25} height={25} color="primary" />
            </span>
            <h4>Fetching Collection details ....</h4>
          </div>
        )
      }

      {
        (!loading && isError && !collectionInfo) && (
          <h3 className="text-center">{isError.errors![0].message}</h3>
        )
      }

      {
        (!loading && collectionInfo !== null && !isError) && (
          <Formik
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            validationSchema={formSchema}
            validate={handleValidateForm}
          >
            {({ isSubmitting, handleChange, values, errors }) => {

              const validateAsync = value => {
                if (shallowEqual(formInitialValues, values)) {
                  setIsDisable(true);
                }
                else {
                  setIsDisable(false);
                }
              };

              return (
                <Form id="form-create-item" className="form-border">
                  <h5>Logo Image</h5>

                  <label
                    htmlFor="logoImage"
                    className="block border-dashed border-[3px] p-0.5  border-gray-300"
                    style={{
                      cursor: "pointer",
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                    }}
                  >
                    {(values.profileImage || profileImage) && (
                      <img
                        src={profileImage ? URL.createObjectURL(profileImage) : `${S3_BUCKET.URL}/${values?.profileImage}?${uuid()}`}
                        className="pb-0.5 inline object-cover overflow-hidden hover:shadow-lg"
                        alt="Collection Logo Image"
                        style={{
                          cursor: "pointer",
                          padding: "0px",
                          margin: "0px",
                          borderRadius: "50%",
                          width: "100px",
                          height: "100px",
                        }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      id="logoImage"
                      name="logoImage"
                      onChange={handleImageChange}
                      // onChange={e => { e?.target?.files && e.target.files[0] && setProfileImage(e.target.files[0]) }}
                      style={{ display: "none" }}
                    />
                  </label>

                  <div className="spacer-single"></div>
                  <h5>Cover Image</h5>
                  <label
                    style={{ height: (values.coverImage || coverImage) ? undefined : "12rem" }}
                    htmlFor="coverImage"
                    className="block w-full h-48 max-h-48 max-w-sm border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
                  >
                    {(values.coverImage || coverImage) ? (
                      <img
                        src={coverImage ? URL.createObjectURL(coverImage) : `${S3_BUCKET.URL}/${values?.coverImage}?${uuid()}`}
                        className="w-full h-[190px] max-h-[190px] object-cover max-w-sm p-0.5 rounded-lg relative overflow-y-hidden"
                        alt="Collection Cover Image"
                      />
                    ) : (
                      <p className="text-center inline-flex items-center h-full w-full justify-center">
                        PNG, JPG, GIF, WEBP or MP4. Max 200mb.
                      </p>
                    )}

                    <input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      onChange={handleImageChange}
                      // onChange={e => { e?.target?.files && e.target.files[0] && setCoverImage(e.target.files[0]) }}
                      style={{ display: "none" }}
                    />
                  </label>

                  <div className="spacer-single"></div>

                  <h5>Collection Name</h5>
                  <Input type="text" validate={validateAsync} name="name" className="form-control mb-1" placeholder="e.g. 'Crypto Funk" />
                  <br />

                  <h5>Category</h5>
                  <Input name="category" as="select" value={values.category} onChange={handleChange} className="form-select mb-1">
                    {["", ...Object.values(Category)].map((v, idx) => <option key={idx} value={v} >{v}</option>)}
                  </Input>
                  <br />

                  <h5>Description</h5>
                  <Input data-autoresize name="description" as="textarea" className="form-control mb-1" placeholder="e.g. 'This is very limited item'" />
                  <br />
                  <div className="spacer-20"></div>
                  <Button disabled={isSubmitting || isDisable} type='submit'>
                    {isSubmitting && (<span className='mr-1' ><Spinner width={15} height={15} /></span>)}
                    {isSubmitting ? "Saving Changes ..." : "Save Changes"}
                  </Button>
                </Form>
              )
            }}
          </Formik>
        )
      }

    </>
  )
}

export default UpdateCollectionForm
