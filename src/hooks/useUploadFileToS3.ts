import { generateUniqueId } from "@/lib/portal/helpers";
import { useGetUploadUrlMutation } from "@/lib/portal/features/s3/s3-files-Api";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

/** Uploads a file straight to S3 through a presigned URL and returns its key. */
const useUploadFileToS3 = (): [
  (fileInput: File | FileList, type: string) => Promise<string>,
  { isLoading: boolean }
] => {
  const [getUploadUrl] = useGetUploadUrlMutation();
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = async (
    fileInput: File | FileList,
    type: string
  ): Promise<string> => {
    try {
      setIsLoading(true);
      const file = fileInput instanceof FileList ? fileInput[0] : fileInput;
      const fileName = generateUniqueId(file?.name);

      const response = await getUploadUrl({ fileName }).unwrap();

      if (!response?.success || !response?.uploadUrl) {
        throw new Error(`Failed to get upload URL for ${type} document`);
      }

      await axios.put(response.uploadUrl, file);
      return fileName;
    } catch (error) {
      toast.error(`Failed to upload ${type} document`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [uploadFile, { isLoading }];
};

export default useUploadFileToS3;
