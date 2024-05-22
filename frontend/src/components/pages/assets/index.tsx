import React, { FC } from "react"
import { PageProps } from "gatsby"
import { Layout, Seo } from "../../common"
import { PAGES } from "../../../app-config"
import { Router, RouteComponentProps, useParams } from "@reach/router";
import Default from "./routes/Default"
import Create from "./routes/Create"
import ItemDetail from "./routes/ItemDetail"
import EditNft from "./routes/EditNft"
import ListNft from "./routes/ListNft"

const PARAMS = {
  assetId: PAGES.ASSETS.routes.ITEM_DETAIL.path,
};
export const useAssetsParams = () => useParams<typeof PARAMS>();

const Assets: FC<PageProps> = ({ }) => {
  return (
    <Layout>
      <Router basepath={PAGES.ASSETS.path}>
        <Default path="/" />
        <Create path={PAGES.ASSETS.routes.CREATE.path} />
        <ItemDetail path={PAGES.ASSETS.routes.ITEM_DETAIL.path} />
        <EditNft path={PAGES.ASSETS.routes.ITEM_DETAIL.routes.EDIT.fullpath} />
        <ListNft path={PAGES.ASSETS.routes.ITEM_DETAIL.routes.LIST_NFT.fullpath} />
        <NotFound path='*' />
      </Router>
    </Layout>
  )
}

export default Assets

const NotFound: FC<RouteComponentProps> = () => {
  return (
    <>
      <h1 className="font-sans"> Path Not Found</h1>
    </>
  )
}
