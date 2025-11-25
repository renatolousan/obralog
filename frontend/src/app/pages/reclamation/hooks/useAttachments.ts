import { useState, useRef, useEffect, useCallback } from "react";
import type { AttachmentPreview } from "../utils/types";
import { v4 as uuidv4 } from "uuid"; // não estava carregando o a função randomUUID do módulo crypto

export const useAttachments = () => {
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const attachmentsRef = useRef<AttachmentPreview[]>([]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) =>
        URL.revokeObjectURL(attachment.previewUrl)
      );
    };
  }, []);

  const addAttachments = useCallback((files: File[]) => {
    const nextAttachments: AttachmentPreview[] = [];

    files.forEach((file) => {
      const type = file.type?.toLowerCase() || "";
      const name = file.name?.toLowerCase() || "";

      const isValidImage =
        type.startsWith("image/") || name.match(/\.(jpg|jpeg|png)$/); // fallback pra aceitar imagens no mobile

      if (isValidImage) {
        nextAttachments.push({
          id: uuidv4(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    if (nextAttachments.length) {
      setAttachments((prev) => [...prev, ...nextAttachments]);
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const toRemove = prev.find((attachment) => attachment.id === id);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.previewUrl);
      }
      return prev.filter((attachment) => attachment.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    attachments.forEach((attachment) =>
      URL.revokeObjectURL(attachment.previewUrl)
    );
    setAttachments([]);
  }, [attachments]);

  return {
    attachments,
    addAttachments,
    removeAttachment,
    clearAll,
  };
};
