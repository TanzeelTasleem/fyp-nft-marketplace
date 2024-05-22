import React, { FC } from 'react';
import { Layout } from "../../common";
import { PAGES } from '../../../app-config';
import { PageProps } from 'gatsby';
import { Router, useParams, RouteComponentProps } from '@reach/router';
import UserDetail from './routes/UserDetail';
import UpdateProfileForm from "./routes/UpdateProfileForm"
import UserDetailOwner from "./routes/UserDetailOwner"


const PARAMS = {
    username: PAGES.PROFILE.routes.USER_DETAIL.path,
};
export const useProfileParams = () => useParams<typeof PARAMS>();

const Profile: FC<PageProps> = () => {
    return (
        <Layout>
            <Router basepath={PAGES.PROFILE.path}>
                <UserDetailOwner path="/" />
                <UserDetail path={PAGES.PROFILE.routes.USER_DETAIL.path} />
                <UpdateProfileForm path={PAGES.PROFILE.routes.EDIT_PROFILE.path} />
                <NotFound path='*' />
            </Router>
        </Layout>
    )
}

export default Profile;


const NotFound: FC<RouteComponentProps> = () => {
    return (
        <h1 className='font-sans' > Path Not Found</h1>
    )
}