import { GraphQLResult } from "@aws-amplify/api-graphql"
import { API } from "aws-amplify"
import React, { useEffect, useState } from "react"
import { getCollections } from "../../../../../graphql/queries"
import {
    Collection,
  GetCollectionsOutput,
  QueryGetCollectionsArgs,
} from "../../../../../graphql/types"
import { Card } from "../../../../common"

const GetUserCollections = () => {

  const [collections, setCollections] = useState<Collection[]>()

  const fetchCollections = async () => {
    try {
      const {data} = await API.graphql({
        query: getCollections,
        variables: {
          input: {
            pageSize: 5,
            after: undefined,
          },
        } as QueryGetCollectionsArgs,
      }) as GraphQLResult<{ getCollections: GetCollectionsOutput }>
      console.log("data from getCollections ---->",data )
      setCollections(data?.getCollections.collections)
    } catch (error) {

    }
  }

  useEffect(() => {
    (async () => {
        await fetchCollections()
    })()
  }, [])

  return (
      <>
      {/* {
        collections && (
            collections.map((collection)=>(
                <Card data={
                    previewImg:collection. 
                    authorImg:string
                    title:string
                    bid:string  
                    price:string
                    likes:number
                } />
            ))
        )
      } */}
      </>
      
  )
}

export default GetUserCollections
