import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-4 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute -top-10 sm:-top-12 right-0 bg-white/10 border border-white/20 rounded-full w-9 h-9 sm:w-10 sm:h-10 text-white text-lg sm:text-xl cursor-pointer flex items-center justify-center transition-all backdrop-blur-md hover:bg-white/20 hover:scale-110"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
        <Image
          src={imageUrl}
          alt="Imagem em tela cheia"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          width={800}
          height={600}
          unoptimized
        />
      </div>
    </div>
  );
}

