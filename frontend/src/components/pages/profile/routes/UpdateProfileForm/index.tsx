import React, { useEffect, useState, useRef, FC } from "react";
import { useFormik } from 'formik';
import { RouteComponentProps } from '@reach/router';
import { API } from "aws-amplify";
import { usernameAvailable, getUserProfile } from "../../../../../graphql/queries";
import { updateProfile } from "../../../../../graphql/mutations";
import { validationSchema } from "./Validation";
import { getBase64, shallowDiffReturn, shallowEqual, uuid } from "../../../../../utils/helper";
import { useAppDispatch, RootStateType, useAppSelector } from "../../../../../redux/store";
import { updateCurrentAuthUser } from "../../../../../redux/slices/userAuth"
import { navigate } from 'gatsby-link';
// import { StyledHeader } from '../../../Styles';
import { createGlobalStyle } from 'styled-components';
import Image from "../../../../../img/background/subheader.jpg";
import { Seo } from "../../../../common";
import { PAGES, S3_BUCKET } from '../../../../../app-config';
import { uploadToS3 } from '../../../../../utils/s3-service';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  .mainside{
    .connect-wal{
      display: none;
    }
    .logout{
      display: flex;
      align-items: center;
    }
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const UpdateProfileForm: FC<RouteComponentProps> = () => {
  const dispatch = useAppDispatch();
  const { userData, authState } = useAppSelector(state => state.userAuth)
  const [firstVal, setFirstVal] = useState<any>({});
  const [fetchLoad, setFetchLoad] = useState(true);
  const [usernameAval, setUsernameAval] = useState(false);
  const [searchUsername, setSearchUsername] = useState(false);
  const [checkStart, setCheckStart] = useState(false);
  const [disabledButt, setDisabledButt] = useState(true);
  const [base64Cover, setBase64Cover] = useState(false);
  const [base64Profile, setBase64Profile] = useState(false);
  const [genCode, setGenCode] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [coverImg, setCoverImg] = useState<File | null>(null);
  const inputFileProfile = useRef<any>(null);
  const inputFileCover = useRef<any>(null);


  const fetchDetails = async () => {
    setFetchLoad(true);
    try {
      const getProfile: any = await API.graphql({
        query: getUserProfile,
        variables: { input: { publicAddress: userData?.publicAddress } },
      })
      formik.setFieldValue("username", getProfile.data.getUserProfile.username);
      formik.setFieldValue("displayName", getProfile.data.getUserProfile.displayName)
      formik.setFieldValue("email", getProfile.data.getUserProfile.email)
      formik.setFieldValue("bio", getProfile.data.getUserProfile.bio)
      formik.setFieldValue("profileImage", `user/${getProfile.data.getUserProfile.username}/profile`)
      formik.setFieldValue("coverImage", `user/${getProfile.data.getUserProfile.username}/cover`)
      setFirstVal({
        username: getProfile.data.getUserProfile.username,
        displayName: getProfile.data.getUserProfile.displayName,
        email: getProfile.data.getUserProfile.email,
        bio: getProfile.data.getUserProfile.bio,
        profileImage: getProfile.data.getUserProfile.profileImage,
        coverImage: getProfile.data.getUserProfile.coverImage,
      });
      setFetchLoad(false);
    }
    catch (err) {
      console.log("err", err);
      setFetchLoad(false);
    }
  }

  useEffect(() => {
    setGenCode(uuid());
    fetchDetails();
  }, [userData?.publicAddress])

  const formik = useFormik({
    initialValues: {
      username: '',
      displayName: '',
      email: '',
      bio: "",
      profileImage: "",
      coverImage: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      setDisabledButt(true);
      const diff = shallowDiffReturn(firstVal, values);
      if (diff) {
        try {
          // profileImg
          // coverImg
          const imgUploadRes = await Promise.all([
            profileImg && uploadToS3({ file: profileImg, filePath: `user/${values.username}/profile` }),
            coverImg && uploadToS3({ file: coverImg, filePath: `user/${values.username}/cover` }),
          ])
          console.log("imgUploadRes ===>", imgUploadRes)

          const updateUser: any = await API.graphql({
            query: updateProfile,
            variables: { input: { ...diff } },
          })
          await dispatch(updateCurrentAuthUser())
          formik.resetForm();
          formik.setFieldValue("username", updateUser.data.updateProfile.username);
          formik.setFieldValue("displayName", updateUser.data.updateProfile.displayName);
          formik.setFieldValue("email", updateUser.data.updateProfile.email);
          formik.setFieldValue("bio", updateUser.data.updateProfile.bio);

          setBase64Cover(false);
          setBase64Profile(false);
          setGenCode(uuid());
          formik.setFieldValue("profileImage", `user/${values.username}/profile`);
          formik.setFieldValue("coverImage", `user/${values.username}/cover`);

          setSearchUsername(false);
          setCheckStart(false);
          setUsernameAval(false);
        }
        catch (err) {
          console.log("err ", err);
        }
      }
    },
  });

  const onChangeTextField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const allValues = formik.values;
    formik.setFieldValue(e.target.name, e.target.value);
    allValues[e.target.name] = e.target.value;
    if (shallowEqual(firstVal, allValues)) {
      setDisabledButt(true);
    }
    else {
      setDisabledButt(false);
    }
  }

  // console.log(firstVal, formik.values)

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allValues = formik.values;
    if (e.target.name === "coverImage" || e.target.name === "profileImage") {
      let img: any;
      if (e?.target && e?.target.files) {
        // img = await getBase64(e?.target?.files[0]);
        e.target.name === "profileImage" && formik.setFieldValue(e.target.name, `user/${userData?.username}/profile`);
        e.target.name === "coverImage" && formik.setFieldValue(e.target.name, `user/${userData?.username}/cover`);
        // formik.setFieldValue(e.target.name, img);
        if (e.target.name === "coverImage") {
          setBase64Cover(true);
          setCoverImg(e.target.files[0])
          allValues[e.target.name] = `user/${userData?.username}/cover`;
        }
        else {
          setBase64Profile(true);
          allValues[e.target.name] = `user/${userData?.username}/profile`;
          setProfileImg(e.target.files[0])
        }
      }
    }
    else {
      formik.setFieldValue(e.target.name, e.target.value);
      allValues[e.target.name] = e.target.value;
    }
    if (shallowEqual(firstVal, allValues)) {
      setDisabledButt(true);
    }
    else {
      setDisabledButt(false);
    }
    if (firstVal?.username === e.target.value) {
      setSearchUsername(false);
      setCheckStart(false);
      setUsernameAval(false);
    }
    if (e.target.name === "username" && firstVal?.username !== e.target.value) {
      setCheckStart(true);
      setSearchUsername(true);
      try {
        const userfind: any = await API.graphql({
          query: usernameAvailable,
          variables: { username: e.target.value },
        })
        setUsernameAval(userfind.data.usernameAvailable);
        setSearchUsername(false);
      }
      catch (err) {
        setSearchUsername(false);
      }
    }
  }


  useEffect(() => {
    if (authState && authState === 'SIGNED_OUT') {
      navigate("/");
    }
  }, [authState])

  if (!authState || authState === 'SIGNED_OUT' || authState === 'PENDING') {
    return <div><Seo title={PAGES.PROFILE.routes.EDIT_PROFILE.title} /></div>;
  }

  return (

    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${Image})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Edit Profile</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>

        {
          fetchLoad ?
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            :
            <div className="row">
              <div className="col-lg-7 offset-lg-1 mb-5">
                <div className="field-set">

                  <h5>Upload Profile Image</h5>

                  {
                    formik.values.profileImage || base64Profile
                      ?
                      <img src={profileImg ? URL.createObjectURL(profileImg) : `${S3_BUCKET.URL}/${formik.values.username}/profile?${genCode}`} style={{ cursor: "pointer", borderRadius: "50%", width: "100px", height: "100px" }} onClick={() => inputFileProfile && inputFileProfile?.current.click()} />
                      :
                      <div className="d-create-file" onClick={() => inputFileProfile && inputFileProfile?.current.click()} style={{ cursor: "pointer", borderRadius: "50%", width: "100px" }}>

                        <div className='browse'>

                        </div>
                      </div>
                  }

                  <input
                    type="file"
                    ref={inputFileProfile}
                    accept="image/*"
                    name="profileImage"
                    style={{ display: "none" }}
                    onChange={(e) => onChange(e)}
                  />


                  <div className="spacer-single"></div>
                  <h5>Upload Cover Image</h5>


                  {
                    (formik.values.coverImage || base64Cover)
                      ?
                      <img src={coverImg ? URL.createObjectURL(coverImg) : `${S3_BUCKET.URL}/${formik.values.username}/cover?${genCode}`} style={{ cursor: "pointer", width: "500px", minWidth: "300px", borderRadius: "10px" }} onClick={() => inputFileCover && inputFileCover?.current.click()} />
                      :
                      <div className="d-create-file" onClick={() => inputFileCover && inputFileCover?.current.click()} style={{ cursor: "pointer", width: "500px", minWidth: "300px", height: base64Cover ? undefined : "200px" }}>
                        <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>

                        {/* <p key="{index}">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p> */}
                        <div className='browse'>

                        </div>
                      </div>
                  }

                  <input
                    type="file"
                    id='upload_file'
                    ref={inputFileCover}
                    accept="image/*"
                    name="coverImage"
                    style={{ display: "none" }}
                    onChange={(e) => onChange(e)}
                  />

                  <div className="spacer-single"></div>

                  <form id="form-create-item" className="form-border" onSubmit={formik.handleSubmit}>

                    <h5>Username</h5>
                    <input type="text" name="username" id="username" className="form-control" placeholder="Username" autoComplete="off" value={formik.values.username} onChange={(e) => onChange(e)} />

                    <div className="mt-2 ml-2 flex">
                      {searchUsername && <div style={{ borderTopColor: "transparent", display: "inline-block" }} className="w-4 h-4 border-2 border-grey-400 border-solid rounded-full animate-spin"></div>}
                      {!formik.errors.username && !searchUsername && checkStart &&
                        (usernameAval
                          ?
                          <p className="text-green-500 text-xs ml-2" style={{ display: "inline-block" }}>
                            username "{formik.values.username}" is available.
                          </p>
                          :
                          <p className="text-red-500 text-xs ml-2" style={{ display: "inline-block" }}>
                            Username "{formik.values.username}" has already been taken.
                          </p>)

                      }
                    </div>
                    <p className="text-red-500 text-xs ml-2" style={{ display: "inline-block" }}>
                      {formik.errors.username}
                    </p>

                    <div className="spacer-10"></div>

                    <h5>Display Name</h5>
                    <input type="text" name="displayName" id="display_name" className="form-control" placeholder="Display Name" value={formik.values.displayName} onChange={(e) => onChange(e)} />

                    <p className="text-red-500 text-xs ml-2" style={{ display: "inline-block" }}>
                      {formik.errors.displayName}
                    </p>

                    <h5>Email Address</h5>
                    <input type="email" name="email" id="email" className="form-control" placeholder="Email Address" value={formik.values.email} onChange={(e) => onChange(e)} />

                    <p className="text-red-500 text-xs ml-2" style={{ display: "inline-block" }}>
                      {formik.errors.email}
                    </p>

                    <h5>Add a short bio</h5>
                    <textarea data-autoresize name="bio" id="bio" className="form-control" placeholder="Add a short bio'" onChange={(e) => onChangeTextField(e)} value={formik.values.bio}></textarea>

                    <div className="spacer-10"></div>

                    <button className="btn-main" type="submit" >Save</button>
                    {/* {
                      !disabledButt
                        ?
                        <button
                          className="btn-main"
                          type="submit"
                        >
                          Save
                        </button>
                        :
                        <button
                          className="btn-main"
                          disabled
                          style={{ opacity: "50%" }}
                        >
                          Save
                        </button>
                    } */}

                  </form>
                </div>
              </div>
            </div>
        }
      </section>
    </div>
    // <div className="flex justify-center  mx-auto w-full px-4 mt-16">
    //   <div className="font-sans w-full space-y-10">
    //     <section className='jumbotron breadcumb no-bg'>
    //       <div className='mainbreadcumb'>
    //         <div className='container'>
    //           <div className='row m-10-hor'>
    //             <div className='col-12'>
    //               <h1 className='text-center'>Create</h1>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </section>
    //     <div className="flex max-w-6xl 2xl:max-w-full justify-between">
    //       <div >
    //         <p className="font-semibold md:text-xl text-lg mb-6	">
    //           Upload a profile image.
    //         </p>
    //         {/* <p>Recommended size:</p>
    //         <p>1000x1000px.</p>
    //         <p>JPG, PNG, or GIF.</p>
    //         <p>10MB max size.</p> */}
    //           {
    //             formik.values.profileImage || base64Profile
    //             ?
    //             <img src={base64Profile ? formik.values.profileImage : `${S3_BUCKET}/${formik.values.profileImage}?${genCode}`} className="md:w-28 w-24 md:h-28 h-24 rounded-full bg-gray-200 cursor-pointer" onClick={() => inputFileProfile && inputFileProfile?.current.click()}/>
    //             :
    //             <div className="md:w-28 w-24 md:h-28 h-24 rounded-full bg-gray-200 cursor-pointer" onClick={() => inputFileProfile && inputFileProfile?.current.click()}></div>
    //           }
    // <input 
    //   type="file"
    //   ref={inputFileProfile}
    //   accept="image/*"
    //   name="profileImage"
    //   style={{ display: "none" }}
    //   onChange={(e) => onChange(e)}
    // />
    //       </div>
    //     </div>
    //     <div className="font-sans flex max-w-6xl 2xl:max-w-full justify-between">
    //       <div>
    //         <p className="font-semibold md:text-xl text-lg mb-6	">
    //           Upload a cover image.
    //         </p>
    //           {/* <p>Recommended size:</p>
    //           <p>1500x500px.</p>
    //           <p>JPG, PNG, or GIF.</p>
    //           <p>10MB max size.</p> */}
    //           {
    //             formik.values.coverImage || base64Cover
    //             ?
    //             <img src={base64Cover ? formik.values.coverImage : `${S3_BUCKET}/${formik.values.coverImage}?${genCode}`} className="md:w-40 w-24 md:h-28 h-24 rounded-2xl bg-gray-200 cursor-pointer" onClick={() => inputFileCover && inputFileCover?.current.click()}/>
    //             :
    //             <div className="md:w-40 w-24 md:h-28 h-24 rounded-2xl bg-gray-200 cursor-pointer" onClick={() => inputFileCover && inputFileCover?.current.click()}></div>
    //           }
    //         <input 
    //             type="file"
    //             ref={inputFileCover}
    //             accept="image/*"
    //             name="coverImage"
    //             style={{ display: "none" }}
    //             onChange={(e) => onChange(e)}
    //           />
    //       </div>
    //     </div>

    //     <form className="bg-white space-y-5  pt-6 pb-8 mb-4" onSubmit={formik.handleSubmit}>
    //       <div className="mb-4 md:max-w-xs">
    //         <label
    //           className="block text-gray-700 text-sm font-bold mb-2"
    //           id="username"
    //         >
    //           Username
    //         </label>
    //         <input
    //           className={`shadow appearance-none border text-sm focus:border-transparent focus:ring-2 focus:ring-black rounded w-full py-2 px-3 text-gray-700 leading-loose focus:outline-none focus:shadow-outline ${(formik.errors.username || (!searchUsername && checkStart && !usernameAval)) && "border-red-500"}`}
    //           id="username"
    //           autoComplete="off"
    //           onChange={(e) => onChange(e)}
    //           value={formik.values.username}
    //           type="text"
    //           placeholder="Username"
    //           name="username"
    //         />
    //         <div className="mt-2 ml-2 flex">
    //           {searchUsername && <div style={{borderTopColor:"transparent", display: "inline-block"}} className="w-4 h-4 border-2 border-grey-400 border-solid rounded-full animate-spin"></div>}
    //           {!formik.errors.username && !searchUsername && checkStart &&
    //             (usernameAval
    //             ?
    //               <p className="text-green-500 text-xs ml-2" style={{display: "inline-block"}}>
    //                 username "{formik.values.username}" is available.
    //               </p>
    //             :
    //               <p className="text-red-500 text-xs ml-2" style={{display: "inline-block"}}>
    //                 Username "{formik.values.username}" has already been taken.
    //               </p>)

    //           }
    //         </div>
    //         <p className="text-red-500 text-xs ml-2" style={{display: "inline-block"}}>
    //           {formik.errors.username}
    //         </p>
    //       </div>
    //       <div className="mb-4 md:max-w-xs">
    //         <label
    //           className="block text-gray-700 text-sm font-bold mb-2"
    //           id="displayName"
    //         >
    //           Display Name
    //         </label>
    //         <input
    //           className={`shadow appearance-none border focus:border-transparent  focus:ring-2 focus:ring-black text-sm rounded w-full py-2 px-3 text-gray-700 leading-loose focus:outline-none focus:shadow-outline ${formik.errors.displayName && "border-red-500"}`}
    //           id="DisplayName"
    //           type="text"
    //           name="displayName"
    //           onChange={(e) => onChange(e)}
    //           value={formik.values.displayName}
    //           placeholder="Display Name"
    //         />
    //         <p className="text-red-500 text-xs ml-2" style={{display: "inline-block"}}>
    //           {formik.errors.displayName}
    //         </p>
    //       </div>
    //       <div className="mb-4 md:max-w-xs">
    //         <label
    //           className="block text-gray-700 text-sm font-bold mb-2"
    //           id="emailAddress"
    //         >
    //           Email Address
    //         </label>
    //         <input
    //           className={`shadow appearance-none border focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black ${formik.errors.email && "border-red-500"} text-sm rounded w-full py-2 px-3 text-gray-700 leading-loose focus:outline-none focus:shadow-outline`}
    //           id="emailAddress"
    //           type="email"
    //           name="email"
    //           onChange={(e) => onChange(e)}
    //           value={formik.values.email}
    //           placeholder="Email Address"
    //         />
    //         <p className="text-red-500 text-xs ml-2" style={{display: "inline-block"}}>
    //           {formik.errors.email}
    //         </p>
    //       </div>

    //       <div className="mb-4 md:max-w-xs">
    //         <label
    //           className="block text-gray-700 text-sm font-bold mb-2"
    //           id="bio"
    //         >
    //           Add a short bio
    //         </label>
    //         <textarea
    //           className={`shadow appearance-none border focus:border-transparent focus:ring-2 focus:ring-black rounded w-full py-2 px-3 text-gray-700 text-sm leading-loose focus:outline-none focus:shadow-outline ${formik.errors.bio && "border-red-500"}`}
    //           id="bio"
    //           autoComplete="off"
    //           name="bio"
    //           onChange={(e) => onChangeTextField(e)}
    //           value={formik.values.bio}
    //           placeholder="Add a short bio"
    //           rows={5}
    //         ></textarea>
    //         <p className="text-red-500 text-xs ml-2" style={{display: "inline-block"}}>
    //           {formik.errors.bio}
    //         </p>
    //       </div>
    //       <div className="flex items-center justify-between mt-16">
    //           {
    //             !disabledButt
    //             ?
    //               <button
    //                 className="text-white hover:bg-black bg-gray-900 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
    //                 type="submit"
    //               >
    //                 Save
    //               </button>
    //             :
    //               <button
    //                 className="text-white hover:bg-black bg-gray-900 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 cursor-auto"
    //                 disabled
    //               >
    //                 Save
    //               </button>
    //           }

    //       </div>
    //     </form>
    //   </div>
    // </div>
  )
}

export default UpdateProfileForm;