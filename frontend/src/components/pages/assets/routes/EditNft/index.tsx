import React, { FC } from "react"
import { RouteComponentProps, useParams } from '@reach/router';

const EditNft: FC<RouteComponentProps> = () => {
    const { assetId } = useParams();
    console.log("assetId", assetId)

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div>EditNft</div>
    </>
  )
}

export default EditNft
