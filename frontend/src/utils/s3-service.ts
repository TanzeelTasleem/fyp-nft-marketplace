import axios from 'axios';
import { CurrentToken } from './local-storage-handler';
// import { API_BASE_URL } from 'src/constants';

const API_BASE_URL = process.env.API_BASE_URL!;

export async function uploadToS3({ file, filePath }: { file: File, filePath: string }) {
   try {
      const presignedPostUrl = await getPresignedPostUrl(file.type, filePath);

      console.log("presignedPostUrl", presignedPostUrl)
   
      const formData = new FormData();
      formData.append('Content-Type', file.type);
      Object.entries(presignedPostUrl.fields).forEach(([k, v]) => {
         formData.append(k, v);
      });
      formData.append('file', file); // The file has be the last element
   
      const response = await axios.post(presignedPostUrl.url, formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
            // Authorization: `Bearer ` + new CurrentToken().get().token!
         },
      });
   
      return presignedPostUrl.filePath;
         
   } catch (error) {
      console.log("error in getting pre-signed url");
        
   }
}

type PresignedPostUrlResponse = {
   url: string;
   fields: {
      key: string;
      acl: string;
      bucket: string;
   };
   filePath: string;
};


export async function getPresignedPostUrl(fileType: string, filePath: string) {
   console.log(`${API_BASE_URL}?fileType=${fileType}&filePath=${btoa(filePath)}`,"testing url for s3")
   const { data: presignedPostUrl } = await axios.get<PresignedPostUrlResponse>(
      `${API_BASE_URL}?fileType=${fileType}&filePath=${btoa(filePath)}`,
      { headers: { Authorization: `Bearer ` + new CurrentToken().get().token! } });

   return presignedPostUrl;
}
