
import {query as q, Client} from 'faunadb'


exports.handler = async (event: any) => {


    try {
   
        const faunaSecret = process.env.faunaSecret!
        const faunaServer = process.env.faunaServer!
        console.log('faunasecret',faunaSecret)
        console.log('faunaserver',faunaServer)


        var client = new Client({
            secret: faunaSecret,
            domain: faunaServer,
            // NOTE: Use the correct domain for your database's Region Group.
            port: 443,
            scheme: 'https',
          })

  /////////// HISTORY /////////////

  // const createBid = await client.query(
  //   q.CreateCollection({ name: 'history' })
  // )

  const getHistoryBytokenId_sortBy_ts_descIndex =  await client.query(
    q.CreateIndex(

      {
        name: "getHistoryBytokenId_sortBy_ts_desc",
        unique: false,
        serialized: true,
        source: q.Collection("history"),
        terms: [
          {
            field: ["data", "tokenId"]
          }
        ],
        values: [
          {
            field: ["ts"],
            reverse: true
          },
          {
            field: ["ref"]
          }
        ]
      }

    )
  )

  const getHistoryBytokenId_sortBy_ts_ascIndex =  await client.query(
        q.CreateIndex(
    
          {
            name: "getHistoryBytokenId_sortBy_ts_asc",
            unique: false,
            serialized: true,
            source: q.Collection("history"),
            terms: [
              {
                field: ["data", "tokenId"]
              }
            ],
            values: [
              {
                field: ["ts"]
              },
              {
                field: ["ref"]
              }
            ]
          }
    
        )
    )

    const uniqueTransactionBid =  await client.query(
      q.CreateIndex(
        {
          name: "uniqueTransactionByHashOnHistory",
          unique: true,
          serialized: true,
          source: q.Collection("history"),
          terms: [
            {
              field: ["data", "transactionHash"]
            },
            {
              field: ["data", "type"]
            }
          ]
        }
      )
    )

  ///////////// COLLECTION //////////////
  // const createCollectionsCollection = await client.query(
  //   q.CreateCollection({ name: 'collections' })
  // )

  const createUniqueCollectionById =  await client.query(
    q.CreateIndex(
      {
        name: "uniqueCollectionID",
        unique: true,
        serialized: true,
        source: q.Collection("collections"),
        terms: [
          {
            field: ["data", "id"]
          }
        ]
      }
    )
  )

  const searchCollectionByName =  await client.query(
    q.CreateIndex(
      {
        name: "searchCollectionByName",
        source: q.Collection("collections")
      }
    )
  )

  const ListsCollection =  await client.query(
    q.CreateIndex(
      {
        name: "ListsCollection",
        unique: false,
        serialized: true,
        source: q.Collection("collections"),
        values: [
          {
            field: ["ref"]
          }
        ]
      }
    )
  )

  // const createCollectionsNft = await client.query(
  //   q.CreateCollection({ name: 'nfts' })
  // )


  const createUniqueNftByTransactionHash =  await client.query(
    q.CreateIndex(
      {
        name: "uniqueMintNftTransactionHash",
        unique: true,
        serialized: true,
        source: q.Collection("nfts"),
        terms: [
          {
            field: ["data", "transactionHash"]
          }
        ]
      }
    )
  )

  // const createCollectionsNftListings = await client.query(
  //   q.CreateCollection({ name: 'nftListings' })
  // )

    const getListedNftByToken =  await client.query(
    q.CreateIndex(
      {
        name: "getListedNftByToken",
        unique: false,
        serialized: true,
        source: q.Collection("nftListings"),
        terms: [
          {
            field: ["data", "tokenId"]
          }
        ]
      }
    )
  )

  const getNftsByCollection =  await client.query(
    q.CreateIndex(
      {
        name: "getNftsByCollection",
        unique: false,
        serialized: true,
        source: q.Collection("nfts"),
        terms: [
          {
            field: ["data", "collectionRef"]
          }
        ]
      }
    )
  )



  
  const createGetListedNfts_searchBy_listingType_sortBy_ts_descIndex =  await client.query(
    q.CreateIndex(
      {
        name: "getListedNfts_searchBy_listingType_sortBy_ts_desc",
        unique: false,
        serialized: true,
        source: q.Collection("nftListings"),
        terms: [
          {
            field: ["data", "listingType"]
          }
        ],
        values: [
          {
            field: ["ts"],
            reverse: true
          },
          {
            field: ["ref"]
          }
        ]
      }

    )
    )


    const createGetListedNfts_searchBy_listingType_sortBy_ts_ascIndex =  await client.query(
      q.CreateIndex(
        {
          name: "getListedNfts_searchBy_listingType_sortBy_ts_asc",
          unique: false,
          serialized: true,
          source: q.Collection("nftListings"),
          terms: [
            {
              field: ["data", "listingType"]
            }
          ],
          values: [
            {
              field: ["ts"]
            },
            {
              field: ["ref"]
            }
          ]
        }

      )
      )


      const createGetListedNfts_searchBy_category_sortBy_ts_descIndex =  await client.query(
        q.CreateIndex(
          {
            name: "getListedNfts_searchBy_category_sortBy_ts_desc",
            unique: false,
            serialized: true,
            source: q.Collection("nftListings"),
            terms: [
              {
                field: ["data", "category"]
              }
            ],
            values: [
              {
                field: ["ts"],
                reverse: true
              },
              {
                field: ["ref"]
              }
            ]
          }

        )
        )



        const createGetListedNfts_searchBy_status_sortBy_ts_descIndex =  await client.query(
          q.CreateIndex(
      
            {
              name: "getListedNfts_searchBy_status_sortBy_ts_desc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "blockChainStatus"]
                }
              ],
              values: [
                {
                  field: ["ts"],
                  reverse: true
                },
                {
                  field: ["ref"]
                }
              ]
            }
      
          )
          )
      
        const createGetListedNfts_searchBy_status_sortBy_ts_ascIndex =  await client.query(
          q.CreateIndex(
      
            {
              name: "getListedNfts_searchBy_status_sortBy_ts_asc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "blockChainStatus"]
                }
              ],
              values: [
                {
                  field: ["ts"]
                },
                {
                  field: ["ref"]
                }
              ]
            }
      
          )
          )
      


  const getNftByTokenId =  await client.query(
    q.CreateIndex(
      {
        name: "getNftByTokenId",
        unique: true,
        serialized: true,
        source: q.Collection("nfts"),
        terms: [
          {
            field: ["data", "tokenId"]
          }
        ]
      }
    )
  )
          



    const createGetListedNfts_searchBy_publicAddress_sortBy_ts_ascIndex =  await client.query(
      q.CreateIndex(
        {
          name: "getListedNfts_searchBy_publicAddress_sortBy_ts_asc",
          unique: false,
          serialized: true,
          source: q.Collection("nftListings"),
          terms: [
            {
              field: ["data", "listedBy"]
            }
          ],
          values: [
            {
              field: ["ts"]
            },
            {
              field: ["ref"]
            }
          ]
        }

      )
      )



      
      const createGetListedNfts_searchBy_publicAddress_sortBy_ts_descIndex =  await client.query(
        q.CreateIndex(
          {
            name: "getListedNfts_searchBy_publicAddress_sortBy_ts_desc",
            unique: false,
            serialized: true,
            source: q.Collection("nftListings"),
            terms: [
              {
                field: ["data", "listedBy"]
              }
            ],
            values: [
              {
                field: ["ts"],
                reverse: true
              },
              {
                field: ["ref"]
              }
            ]
          }

        )
        )



        

    const createGetListedNfts_searchBy_blockChainStatus_sortBy_ts_ascIndex =  await client.query(
      q.CreateIndex(
        {
          name: "getListedNfts_searchBy_blockChainStatus_sortBy_ts_asc",
          unique: false,
          serialized: true,
          source: q.Collection("nftListings"),
          terms: [
            {
              field: ["data", "blockChainStatus"]
            }
          ],
          values: [
            {
              field: ["ts"]
            },
            {
              field: ["ref"]
            }
          ]
        }

      )
      )



      
      const createGetListedNfts_searchBy_blockChainStatus_sortBy_ts_descIndex =  await client.query(
        q.CreateIndex(
          {
            name: "getListedNfts_searchBy_blockChainStatus_sortBy_ts_desc",
            unique: false,
            serialized: true,
            source: q.Collection("nftListings"),
            terms: [
              {
                field: ["data", "blockChainStatus"]
              }
            ],
            values: [
              {
                field: ["ts"],
                reverse: true
              },
              {
                field: ["ref"]
              }
            ]
          }

        )
        )


  // /////USER //////////////
  //  const createUsersCollection = await client.query(
  //   q.CreateCollection({ name: 'users' })
  // )

  // const createNftListingsCollection = await client.query(
  //   q.CreateCollection({ name: 'nftListings' })
  // )

  // const createFollowingCollection = await client.query(
  //   q.CreateCollection({ name: 'followings' })
  // )

  const createFollowingToIndex =  await client.query(
    q.CreateIndex(
      {
        name: "getUserFollowers",
        unique: false,
        serialized: true,
        source: q.Collection("followings"),
        terms: [
          {
            field: ["data", "to"]
          }
        ]
      }
    )
  )

  const checkFollowingToIndex =  await client.query(
    q.CreateIndex(
      {
        name: "checkFollowing",
        unique: true,
        serialized: true,
        source: q.Collection("followings"),
        terms: [
          {
            field: ["data", "from"]
          },
          {
            field: ["data", "to"]
          }
        ]
      }
    )
  )

  const createFollowingFromIndex =  await client.query(
    q.CreateIndex(
      {
        name: "getUserFollowings",
        unique: false,
        serialized: true,
        source: q.Collection("followings"),
        terms: [
          {
            field: ["data", "from"]
          }
        ]
      }
    )
  )


  const createUniqueUsernameIndex =  await client.query(
    q.CreateIndex(
      {
        name: "uniqueUsername",
        unique: true,
        serialized: true,
        source: q.Collection("users"),
        terms: [
          {
            field: ["data", "username"]
          }
        ]
      }
    )
  )



  const createUniquePublicAddressIndex = await client.query(
  q.CreateIndex(
    {
      name: "uniquePublicAddress",
      unique: true,
      serialized: true,
      source: q.Collection("users"),

      terms: [
        {
          field: ["data", "publicAddress"]
        }
      ]
    }
  )
  )



  const createUniqueNftListingIndex =  await client.query(
    q.CreateIndex(
      {
        name: "uniqueNftListing",
        unique: true,
        serialized: true,
        source: q.Collection("nftListings"),
        terms: [
          {
            field: ["data", "contractAddress"]
          },
          {
            field: ["data", "tokenId"]
          }
        ]
      }

    )
    )



  const createGetListedNfts_searchBy_status_sortBy_price_descIndex =  await client.query(
    q.CreateIndex(

      {
        name: "getListedNfts_searchBy_status_sortBy_price_desc",
        unique: false,
        serialized: true,
       source: q.Collection("nftListings"),
        terms: [
          {
            field: ["data", "blockChainStatus"]
          }
        ],
        values: [
          {
            field: ["data", "sellPrice"],
            reverse: true
          },
          {
            field: ["ref"]
          }
        ]
      }

    )
    )

    const createGetListedNfts_searchBy_status_sortBy_price_ascIndex =  await client.query(
      q.CreateIndex(
        {
          name: "getListedNfts_searchBy_status_sortBy_price_asc",
          unique: false,
          serialized: true,
          source: q.Collection("nftListings"),
          terms: [
            {
              field: ["data", "blockChainStatus"]
            }
          ],
          values: [
            {
              field: ["data", "sellPrice"]
            },
            {
              field: ["ref"]
            }
          ]
        }

      )
      )





        const createGetListedNfts_searchBy_listingType_sortBy_price_descIndex =  await client.query(
          q.CreateIndex(
            {
              name: "getListedNfts_searchBy_listingType_sortBy_price_desc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "listingType"]
                }
              ],
              values: [
                {
                  field: ["data", "sellPrice"],
                  reverse: true
                },
                {
                  field: ["ref"]
                }
              ]
            }

          )
          )





        const createGetListedNfts_searchBy_listingType_sortBy_price_ascIndex =  await client.query(
          q.CreateIndex(
            {
              name: "getListedNfts_searchBy_listingType_sortBy_price_asc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "listingType"]
                }
              ],
              values: [
                {
                  field: ["data", "sellPrice"]
                },
                {
                  field: ["ref"]
                }
              ]
            }

          )
          )




        const createGetListedNfts_searchBy_category_sortBy_price_descIndex =  await client.query(
          q.CreateIndex(
            {
              name: "getListedNfts_searchBy_category_sortBy_price_desc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "category"]
                }
              ],
              values: [
                {
                  field: ["data", "sellPrice"],
                  reverse: true
                },
                {
                  field: ["ref"]
                }
              ]
            }

          )
          )




        const createGetListedNfts_searchBy_category_sortBy_price_ascIndex =  await client.query(
          q.CreateIndex(
            {
              name: "getListedNfts_searchBy_category_sortBy_price_asc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "category"]
                }
              ],
              values: [
                {
                  field: ["data", "sellPrice"]
                },
                {
                  field: ["ref"]
                }
              ]
            }
          )
          )



  const createGetListedNfts_searchBy_userRefId_sortBy_ts_ascIndex = await client.query(
    q.CreateIndex(
      {
        name: "getListedNfts_searchBy_userRefId_sortBy_ts_asc",
        unique: false,
        serialized: true,
        source: q.Collection("nftListings"),
        terms: [
          {
            field: ["data", "userRefId"]
          }
        ],
        values: [
          {
            field: ["ts"]
          },
          {
            field: ["ref"]
          }
        ]
      }
    )
  )


  const createGetListedNfts_searchBy_userRefId_sortBy_ts_descIndex = await client.query(
    q.CreateIndex(
      {
        name: "getListedNfts_searchBy_userRefId_sortBy_ts_desc",
        unique: false,
        serialized: true,
        source: q.Collection("nftListings"),
        terms: [
          {
            field: ["data", "userRefId"]
          }
        ],
        values: [
          {
            field: ["ts"],
            reverse: true
          },
          {
            field: ["ref"]
          }
        ]
      }
    )
  )


          const createGetListedNfts_searchBy_userRefId_sortBy_price_descIndex =  await client.query(
          q.CreateIndex(
            {
              name: "getListedNfts_searchBy_userRefId_sortBy_price_desc",
              unique: false,
              serialized: true,
              source: q.Collection("nftListings"),
              terms: [
                {
                  field: ["data", "userRefId"]
                }
              ],
              values: [
                {
                  field: ["data", "sellPrice"],
                  reverse: true
                },
                {
                  field: ["ref"]
                }
              ]
            }

          )
          )



          const createGetListedNfts_searchBy_userRefId_sortBy_price_ascIndex =  await client.query(
            q.CreateIndex(
              {
                name: "getListedNfts_searchBy_userRefId_sortBy_price_asc",
                unique: false,
                serialized: true,
                source: q.Collection("nftListings"),
                terms: [
                  {
                    field: ["data", "userRefId"]
                  }
                ],
                values: [
                  {
                    field: ["data", "sellPrice"],
                  },
                  {
                    field: ["ref"]
                  }
                ]
              }
  
            )
            )
  
  


            console.log('code executed')




    }

    catch (e) {
       
        console.log(e)
    }

}