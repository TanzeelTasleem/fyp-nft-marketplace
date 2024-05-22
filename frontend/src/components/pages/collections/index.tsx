import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../common";
import { PAGES } from "../../../app-config";
import { Router, RouteComponentProps } from '@reach/router';
import Default from './routes/Default';
import Create from './routes/Create';
import CollectionDetail from './routes/CollectionDetail';
import EditCollection from './routes/EditCollection';

const Collection: FC<PageProps> = ({ }) => {
    return (
        <Layout>
            <Router basepath={PAGES.COLLECTIONS.path} >
                <Default path='/' />
                <Create path={PAGES.COLLECTIONS.routes.CREATE.path} />
                <CollectionDetail path={PAGES.COLLECTIONS.routes.COLLECTION_DETAIL.path} />
                <EditCollection path={PAGES.COLLECTIONS.routes.COLLECTION_DETAIL.routes.EDIT.fullpath} />
                <NotFound path='*' />
            </Router>
        </Layout>
    )
}

export default Collection;

const NotFound: FC<RouteComponentProps> = () => {
    return (
        <h1 className='font-sans' > Path Not Found</h1>
    )
}