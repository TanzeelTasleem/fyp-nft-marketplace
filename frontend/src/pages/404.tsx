import React, { FC, useEffect, useState } from 'react';
import { Layout, Seo } from '../components/common';
import { PAGES } from '../app-config';
import { PageProps } from 'gatsby';

const PageNotFound: FC<PageProps> = () => {
  const [isMount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  if (!isMount) {
    return (
      <Layout>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          {/* <div
            style={{ borderTopColor: 'transparent', display: 'inline-block' }}
            className="w-10 h-10 border-4 border-green-600 border-solid rounded-full animate-spin"
          /> */}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title={PAGES[404].title} />
      <h1> Sorry Page Not Found </h1>
    </Layout>
  );
};

export default PageNotFound;
