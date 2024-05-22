import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../common";
import { PAGES } from "../../../app-config";
import { Router, RouteComponentProps } from '@reach/router';
import Dashboard from './routes/Dashboard';
import Login from './routes/login';

const Admin: FC<PageProps> = ({ }) => {
    return (
        <Layout>
            <Router basepath={PAGES.ADMIN.path} >
                <Dashboard path='/' />
                <Login path={PAGES.ADMIN.routes.LOGIN.path} />
                {/* <CreateNft path={PAGES.ADMIN.routes.CREATE.path} /> */}
                {/* <CreateCollection path={PAGES.ADMIN.routes.CREATE.routes.COLLECTION.path}/> */}
                <NotFound path='*' />
            </Router>
        </Layout>
    )
}

export default Admin;

const NotFound: FC<RouteComponentProps> = () => {
    return (
        <h1 className='font-sans' > Path Not Found</h1>
    )
}