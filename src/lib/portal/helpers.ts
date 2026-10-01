/** Prefixes a file name with a timestamp and random suffix so S3 keys never collide. */
export const generateUniqueId = (fileName: string) => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}-${fileName}`;
};
