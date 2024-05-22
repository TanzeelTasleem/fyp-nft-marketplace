import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../common";
import { PAGES } from "../../../app-config";

const Activity: FC<PageProps> = ({ }) => {
    return (
        <Layout>
            <Seo title={PAGES.ACTIVITY.title} />
            <div className='mt-20' >
                Activity
            </div>
        </Layout>
    )
}

export default Activity;