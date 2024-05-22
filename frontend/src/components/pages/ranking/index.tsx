import React, { FC } from 'react';
import { PageProps } from 'gatsby';
import { Layout, Seo } from "../../common";
import { PAGES } from "../../../app-config";

const Ranking: FC<PageProps> = ({ }) => {
    return (
        <Layout>
            <Seo title={PAGES.RANKING.title} />
            <div className='mt-20' >
                Ranking
            </div>
        </Layout>
    )
}

export default Ranking;