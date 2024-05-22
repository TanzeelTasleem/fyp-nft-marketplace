import { API, Storage } from "aws-amplify"
import { StoragePutConfig, PutResult } from "@aws-amplify/storage"
import { getBlockChainStatus } from "../graphql/queries"
import { BlockChainStatus, BlockChainStatus_Type, GetBlockChainStatusOutput, QueryGetBlockChainStatusArgs } from "../graphql/types"
import { GraphQLResult } from "./global-types"
import { ethers } from "ethers"

export async function delay(delayTime: number) {
  await new Promise(resolve => {
    setTimeout(resolve, delayTime)
  })
}

export const getCurrentBlockTime = async (web3Provider: ethers.providers.Web3Provider) => {
  const blockNumber = await web3Provider.getBlockNumber();
  const block = await web3Provider.getBlock(blockNumber);
  return block.timestamp * 1000;
}

export const getBase64 = (file: any) =>
  new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      reader.result && resolve(reader.result)
    }
    reader.onerror = error => reject(error)
  })

export function shallowDiffReturn(object1: any, object2: any) {
  const keys1 = Object.keys(object1)
  let diff = {}
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      diff = { [key]: object2[key], ...diff }
    }
  }
  return diff
}

export function shallowEqual(object1: any, object2: any) {
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false
    }
  }
  return true
}

export const getFileFromS3 = async (key: string) => {
  return await Storage.get(key)
}

export const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const uploadFileToS3 = async (
  file: File,
  path: string,
  config: StoragePutConfig<PutResult> = {}
) => {
  const res = await Storage.put(path, file, config)
  // console.log(res);
  return res
}

export const checkBlockChainStatus = async (
  id: String,
  statusType: keyof typeof BlockChainStatus_Type
) => {
  while (true) {
    await delay(5000) // wait for 5 seconds;

    const { data } = (await API.graphql({
      query: getBlockChainStatus,
      variables: {
        input: { id, statusType: BlockChainStatus_Type[statusType] },
      } as QueryGetBlockChainStatusArgs,
    })) as GraphQLResult<{ getBlockChainStatus: GetBlockChainStatusOutput }>

    if (data?.getBlockChainStatus.status === BlockChainStatus.STARTED) {
      continue
    } else if (data?.getBlockChainStatus.status === BlockChainStatus.CONFIRMED) {
      return data?.getBlockChainStatus
    } else if (data?.getBlockChainStatus.status === BlockChainStatus.FAILED) {
      throw data?.getBlockChainStatus
    } else if (data?.getBlockChainStatus.status === BlockChainStatus.MANIPULATED) {
      throw data?.getBlockChainStatus
    }

    return data?.getBlockChainStatus
  }
}
// export const getFromStorage = async (key, config = { level: "public" }) => {
//     return await Storage.get(key, config);
// };

// const fileType = path.extname(avatarUrl).replace(".", "");
// const { key } = await uploadToStorage(
//     avatarUrl,
//     `${loggedInUser.id}/avatar`,
//     { contentType: `image/${fileType}` },
// );
// return key;
