export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024).toFixed(2) + " KB";
};

