import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div
        className="image-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="image-modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
        <Image
          src={imageUrl}
          alt="Imagem em tela cheia"
          className="fullscreen-image"
          width={800}
          height={600}
          style={{ objectFit: "contain" }}
          unoptimized
        />
      </div>
    </div>
  );
}

