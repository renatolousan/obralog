export const toUtcMinusFourIsoLocal = () => {
  const now = new Date();
  const utcMinusFour = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return utcMinusFour.toISOString().slice(0, 16);
};

export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

