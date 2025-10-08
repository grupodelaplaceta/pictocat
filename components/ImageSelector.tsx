import React from 'react';
import { CatImage, Phrase } from '../types';
import { CloseIcon } from '../hooks/Icons';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (phraseId: string, imageId: number | null) => void;
  phrase: Phrase | null;
  unlockedImages: CatImage[];
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ isOpen, onClose, onSelectImage, phrase, unlockedImages }) => {
  if (!isOpen || !phrase) return null;

  // For non-custom phrases, find images that share a theme with any of the default images for that phrase.
  // This logic is a placeholder as the direct link from phrase->theme is gone.
  // A better solution would be to tag phrases with themes.
  const relevantImages = unlockedImages;


  return (
    <div className="modal-cartoon-overlay">
      <div className="modal-cartoon-content p-4 sm:p-6 w-full max-w-3xl">
        <header className="flex justify-between items-center mb-4 pb-4 border-b-2 border-liver/20">
          <h2 className="text-lg sm:text-2xl font-bold text-liver">Elige una imagen para "{phrase.text}"</h2>
          <button onClick={onClose} className="text-liver/70 hover:text-liver">
            <CloseIcon className="w-7 h-7" />
          </button>
        </header>
        <div className="flex-grow overflow-y-auto pr-2">
          {relevantImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Option to have no image */}
              <button
                  onClick={() => onSelectImage(phrase.id, null)}
                  className={`aspect-square rounded-lg flex items-center justify-center border-4 transition-colors ${!phrase.selectedImageId ? 'border-buff ring-4 ring-buff/50' : 'border-liver/20 hover:border-liver/40'}`}
              >
                  <span className="text-liver/70 text-lg font-bold">Ninguna</span>
              </button>
              {relevantImages.map(image => (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(phrase.id, image.id)}
                  className={`aspect-square rounded-lg overflow-hidden border-4 transition-all duration-200 ${phrase.selectedImageId === image.id ? 'border-buff ring-4 ring-buff/50 scale-105' : 'border-transparent hover:border-buff'}`}
                >
                  <img src={image.url} alt={image.theme} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-liver/80 py-10">
              <p className="font-bold">No tienes imágenes desbloqueadas.</p>
              <p>¡Compra sobres en la tienda para conseguir más!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;