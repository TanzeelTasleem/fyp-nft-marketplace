import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../../../common";
import { PAGES } from "../../../../../app-config";
import { RouteComponentProps } from '@reach/router';

const AdminLogin: FC<RouteComponentProps> = ({ }) => {
    return (
        <>
            <Seo title={`${PAGES.ADMIN.title} ${PAGES.ADMIN.routes.LOGIN.title}`} />
            <div className='mt-20' >
                Admin Login
            </div>
        </>
    )
}

export default AdminLogin;