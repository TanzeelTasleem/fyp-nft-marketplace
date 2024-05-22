import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from "@reach/router"
import { APPSYNC_GRAPHQL, PAGES, S3_BUCKET } from "../../../../../app-config";
import { Collection, GetCollectionsOutput, QueryGetCollectionsArgs } from '../../../../../graphql/types';
import { API } from 'aws-amplify';
import { getCollections } from '../../../../../graphql/queries';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Card, Spinner } from '../../../../common';
import SEO from '../../../../common/Seo';
import { createGlobalStyle } from 'styled-components';
import CollectionCard from '../../../../common/CollectionCard';
import { date } from 'yup/lib/locale';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);;
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`

const Default: FC<RouteComponentProps> = ({ }) => {

    const [collections, setCollections] = useState<Collection[]>([]);
    const [apiData,setApiData] = useState<{getCollections: GetCollectionsOutput}>();
    const observer = useRef<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [after, setAfter] = useState<string[] | undefined>(undefined);
  
    const fetchCollections = async () => {
      setLoading(true)
      try {
        const {data} = await API.graphql({
          query: getCollections,
          variables: {
            input: {
              pageSize: 2,
              after: after,
            },
          } as QueryGetCollectionsArgs,
        }
        , { 'x-api-key': APPSYNC_GRAPHQL.API_KEY! }
        ) as GraphQLResult<{ getCollections: GetCollectionsOutput }>
        console.log("data from getCollections ---->",data)
        if(data?.getCollections.collections){
          setApiData({getCollections:data.getCollections});
          setCollections([...collections,...data?.getCollections.collections]);
        }
        data?.getCollections.after?.length ? setHasMore(true) : setHasMore(false);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("error in fetch collection ---->",error);
      }
    }

    const lastPostElementRef = useCallback(
      (node) => {
        if (loading) return
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore) {
             console.log("pagination condition true",hasMore);
             setAfter(apiData?.getCollections.after)
          }
        });
        if (node) observer.current.observe(node);
      },
      [loading, hasMore]
    );
  
    useEffect(() => {
      (async () => {
          await fetchCollections()
      })()
    }, [after])
  

    return (
        <>
        <SEO title={PAGES.COLLECTIONS.title} />
        <GlobalStyles />
        <section
          className="jumbotron breadcumb no-bg"
          style={{
            backgroundImage: `url(${"https://gigaland.on3-step.com/img/background/subheader.jpg"})`,
          }}
        >
          <div className="mainbreadcumb">
            <div className="container">
              <div className="row m-10-hor">
                <div className="col-12">
                  <h1 className="text-center">Collections</h1>
                </div>
              </div>
            </div>
          </div>
        </section>
          <div className="flex mt-4 px-3 lg:justify-start md:justify-center flex-wrap space-x-3">
            {collections?.map((collection,index) => (
                    <span key={index} ref={lastPostElementRef}>
                       <CollectionCard data={collection} />
                    </span>
            ))}
          </div>
          {
            loading && (
              <span className='flex justify-center w-full'>
                <Spinner width={25} height={25} color='primary'></Spinner>
                <p className='capitalize'>fetching Collection info ....</p>
              </span>
            )
          }
        </>
    )
}

export default Default;