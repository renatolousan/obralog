import { useState, useCallback } from "react";
import { isValidCSVFile } from "../utils/validators";

export const useCSVFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (isValidCSVFile(selectedFile)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo CSV válido.");
    }

    e.target.value = "";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (isValidCSVFile(droppedFile)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Por favor, arraste um arquivo CSV válido.");
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    isDragging,
    error,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
  };
};

