import axios from 'axios';

interface PinataConstructorProps {
   pinata_api_key: string
   pinata_secret_api_key: string
}
interface PinataApiResponse {
   /** Example
    * "QmeDXL677EZMf8yneoz5KyQuXuJ6diSa3TXFWKb4Uh9VgV"
    */
   IpfsHash: string
   /** Example
    * 164982
    */
   PinSize: number
   /** Example
    * "2022-03-01T12:21:27.975Z"
    */
   Timestamp: string
   isDuplicate?: boolean
}

export class Pinata {
   private pinata_api_key: string
   private pinata_secret_api_key: string
   private headers: { [key: string]: string }
   private apiBaseUrl = "https://api.pinata.cloud/pinning";

   constructor({ pinata_api_key, pinata_secret_api_key }: PinataConstructorProps) {
      this.pinata_api_key = pinata_api_key;
      this.pinata_secret_api_key = pinata_secret_api_key;
      this.headers = { pinata_api_key, pinata_secret_api_key }
   }

   public async pinFileToIPFS(file: File, assetName?: string) {
      const formdata = new FormData();
      formdata.append(`file`, file, assetName || file.name);
      const { data } = await axios.post<any, { data: PinataApiResponse }>(this.apiBaseUrl + "/pinFileToIPFS", formdata, { headers: this.headers });
      return data;
   }

   public async pinJSONToIPFS(meta: { [key: string]: string | number }) {
      const { data } = await axios.post<any, { data: PinataApiResponse }>(this.apiBaseUrl + "/pinJSONToIPFS", meta, { headers: this.headers });
      return data;
   }

}
