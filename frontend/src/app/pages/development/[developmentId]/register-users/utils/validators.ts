export const isValidCSVFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const validExtensions = [".csv"];
  const hasValidExtension = validExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  const validMimeTypes = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain",
    "text/x-csv",
    "application/x-csv",
  ];
  const hasValidMimeType =
    validMimeTypes.includes(file.type) || file.type === "";

  return hasValidExtension && (hasValidMimeType || file.type === "");
};

