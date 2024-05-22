import { reference } from "@popperjs/core"
import { navigate } from "gatsby"
import React, { FC, useState } from "react"
import styled from "styled-components"
import { PAGES, S3_BUCKET } from "../../../app-config"
import { Collection } from "../../../graphql/types"
import { uuid } from "../../../utils/helper"
import Clock from "../Clock"

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`

const CollectionCard: FC<{ data: Collection  }> = ({
  data: { coverImage, profileImage, name, description, id },
}) => {
  const [height, setHeight] = useState(0)

  const onImgLoad = ({ target: img }) => {
    // console.log("from image load --->",img);
    let currentHeight = height
    if (currentHeight < img.offsetHeight) {
      // console.log("from onload Image condition --->");
      setHeight(img.offsetHeight)
    }
  }

  return (
    <div  className="d-item  mb-4 px-1  ">
      <div
        className="nft__item m-0 px-3 p-0 py-4 cursor-pointer min-h-[380px] max-w-sm"
        onClick={() => {
          navigate(`${PAGES.COLLECTIONS.path}/${id}`)
        }}
      >
        
            <div className="h-[300px] md:w-80 w-60">
            <div className="flex items-center " style={{ minHeight: `${280}px` }}>
              {coverImage ? (
                <img
                  onLoad={onImgLoad}
                  src={`${S3_BUCKET.URL}/${coverImage}?${uuid()}`}
                  className="object-cover bg-gray-200 w-full max-h-[290px]  rounded-2xl "
                  alt=""
                />
              ) : (
                <div className=" w-80 h-72 bg-zinc-200 border-2 rounded-2xl" />
              )}
              </div>
            {/* </span>
          </Outer>
        </div> */}

        <div className="flex justify-center">
          {profileImage ? (
            <img
              src={`${S3_BUCKET.URL}/${profileImage}?${uuid()}`}
              className="object-cover max-w-[90px] max-h-[90px] top-64 align-middle absolute bg-zinc-200 border-3  border-white"
              loading="lazy"
              style={{ borderRadius: "9999px" }}
              alt=""
            />
          ) : (
            <div className="w-24 h-24 absolute top-72 rounded-full bg-zinc-200 border-4 border-white"></div>
          )}
        </div>
        </div>

        <div className=" mx-auto justify-center max-w-xs text-center text-gray-900 font-medium font-sans pt-6">
        <h3 className="p-0 m-0 ">{name}</h3>
        {description && (
            <>
              {description?.length > 100 ? (
                <p className="pt-1" >{description?.substring(0, 100)}...</p>
              ) : (
                <p className="pt-1">{description}</p>
              )}
            </>
        )}
        </div>
      </div>
     </div>
  )
}

export default CollectionCard
