export type blockChainListenerEvent = {
    type: string,
    transactionHash: string,
    data: any,
    invokeCounter?: number
}