export type GraphqlError = {
  path: string[];
  data: object | null;
  errorType: string;
  errorInfo: null | object | string;
  locations: { line: number; column: number; sourceName: any }[];
  message: string;
}[];

export interface GraphQLResult<T> {
  data?: T;
  errors?: GraphqlError;
  extensions?: {
    [key: string]: any;
  };
}

export type WalletType = "METAMASK" | "COINBASE";

export type NFTmeta = {
  description: string,
  image: string,
  name: string,
}