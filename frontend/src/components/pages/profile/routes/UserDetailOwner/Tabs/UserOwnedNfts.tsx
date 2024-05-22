import { GraphQLResult } from '@aws-amplify/api-graphql'
import { API } from 'aws-amplify'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { APPSYNC_GRAPHQL } from '../../../../../../app-config'
import { getUserListedNfts, getUsersNfts } from '../../../../../../graphql/queries'
import { GetUserListedNftsInput, GetUserListedNftsOutput, GetUsersNftsOutput, Nft, NftListing, QueryGetUserListedNftsArgs, QueryGetUsersNftsArgs, Sorting_Order, Sort_By } from '../../../../../../graphql/types'
import { useAppSelector } from '../../../../../../redux/store'
import { Spinner } from '../../../../../common'
import NFTCard from '../../../../../common/Card'

const UserOwnedNfts : FC<{refId:string}> = ({refId}) => {
  const {userData} = useAppSelector(s => s.userAuth);
  const observer = useRef<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState<any>();
  const [before, setBefore] = useState()
  const [hasMore, setHasMore] = useState(false);

  
  const lastPostElementRef = useCallback(
    node => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          // console.log("pagination condition true", hasMore, nftInfo.after)
          //  setAfter(nftInfo.after)
          if (userNfts.getUsersNfts.cursor) {
            fetchUserNfts()
          }
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )


  const [userNfts, setUserNfts] = useState<{getUsersNfts:{count:number, cursor?: string , data:Nft[]}}>({getUsersNfts:{count:0 , data:[]}});
    const fetchUserNfts = async() => {
      setLoading(true);
      try {
        const {data} = await API.graphql({
          query:getUsersNfts,
          variables : {
            input:{
                pageSize:2,
                // ...( userData?.publicAddress && {userPublicAddress:userData?.publicAddress} ),
                ...( refId && {refId:refId}),
                ...( hasMore && {cursor:userNfts.getUsersNfts.cursor}),
            }
          } as QueryGetUsersNftsArgs
        },
        { "x-api-key": APPSYNC_GRAPHQL.API_KEY! }
        ) as GraphQLResult<{getUsersNfts:{count:number , cursor?:string , data:Nft[]}}>
        setLoading(false)
        if(data?.getUsersNfts.count && data.getUsersNfts.data.length){
          setUserNfts({getUsersNfts:{count:data.getUsersNfts.count , data:[...userNfts.getUsersNfts.data, ...data.getUsersNfts.data ] , cursor:data.getUsersNfts.cursor}});
          if(data?.getUsersNfts.cursor) { setHasMore(true) }
          else{setHasMore(false)}
        }else{setHasMore(false)}

        console.log("getUserNfts ::::",data)
      } catch (error) {
        setIsError(error as any);
        setLoading(false);
        console.log("getUserNfts_Error", error);       
      }
    }

    useEffect(() => {
      fetchUserNfts()
    }, [refId])
    
  return (
      <div className='pt-10'>

      {userNfts.getUsersNfts.count && (
        <div className="row mx-auto max-w-7xl ">
          {
            [...userNfts.getUsersNfts.data].map((nft , index)=>(
              <div className='d-item col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4 ' key={index} ref={lastPostElementRef} >
                <NFTCard data={{...nft , ...(nft.metadata  && {name: JSON.parse(nft?.metadata).name} )}} />
              </div>
            ))
          }
      </div>
      )
      }

      {loading ? (
            <span className="flex justify-center space-x-3 ">
              <Spinner width={20} height={20} color="primary" />
              <p className="font-medium">Fetching User NFTs ...</p>
            </span>
      ):(!userNfts.getUsersNfts.count) && (
          <span className="flex justify-center space-x-3">
            <p className="font-medium">No Nfts ...</p>
          </span>
      )}

        
      </div>
  )
}

export default UserOwnedNfts
