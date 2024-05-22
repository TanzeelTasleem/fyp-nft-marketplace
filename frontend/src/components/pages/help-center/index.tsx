import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../common";
import { PAGES } from "../../../app-config";

const HelpCenter: FC<PageProps> = ({ }) => {
    return (
        <Layout>
            <Seo title={PAGES.HELP_CENTER.title} />
            <div className='mt-20' >
                Help Center
            </div>
        </Layout>
    )
}

export default HelpCenter;