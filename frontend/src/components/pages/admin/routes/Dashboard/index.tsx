import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../../../common";
import { PAGES } from "../../../../../app-config";
import { RouteComponentProps } from '@reach/router';

const Dashboard: FC<RouteComponentProps> = ({ }) => {
    return (
        <>
            <Seo title={`${PAGES.ADMIN.title} ${PAGES.ADMIN.title}`} />
            <div className='mt-20' >
                Dashboard
            </div>
        </>
    )
}

export default Dashboard;