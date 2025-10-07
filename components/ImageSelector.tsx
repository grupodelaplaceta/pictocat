import React from 'react';
import { CatImage, Phrase } from '../types';
import { CloseIcon } from './Icons';
import { MASTER_IMAGE_CATALOG } from '../initialData';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (phraseId: string, imageId: string | null) => void;
  phrase: Phrase | null;
  unlockedImageIds: Set<string>;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ isOpen, onClose, onSelectImage, phrase, unlockedImageIds }) => {
  if (!isOpen || !phrase) return null;

  const availableImages = MASTER_IMAGE_CATALOG[phrase.id] || [];
  const unlockedPhraseImages = availableImages.filter(img => unlockedImageIds.has(img.id));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Elige una imagen para "{phrase.text}"</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-7 h-7" />
          </button>
        </header>
        <div className="flex-grow overflow-y-auto pr-2">
          {unlockedPhraseImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Option to have no image */}
              <button
                  onClick={() => onSelectImage(phrase.id, null)}
                  className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-colors ${!phrase.selectedImageId ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-200 hover:border-gray-400'}`}
              >
                  <span className="text-gray-500 text-lg">Ninguna</span>
              </button>
              {unlockedPhraseImages.map(image => (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(phrase.id, image.id)}
                  className={`aspect-square rounded-lg overflow-hidden border-4 transition-colors ${phrase.selectedImageId === image.id ? 'border-blue-600 ring-2 ring-blue-600' : 'border-transparent hover:border-orange-500'}`}
                >
                  <img src={image.url} alt={image.theme} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-10">
              <p>No tienes imágenes desbloqueadas para esta frase.</p>
              <p>¡Compra sobres en la tienda para conseguir más!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;