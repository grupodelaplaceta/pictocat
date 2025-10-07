import React from 'react';
import { CatImage } from '../types';
import { CloseIcon } from './Icons';

interface EnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  newImages: CatImage[];
  envelopeName: string;
}

const EnvelopeModal: React.FC<EnvelopeModalProps> = ({ isOpen, onClose, newImages, envelopeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-2xl text-center relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-10">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">¡Has abierto un {envelopeName}!</h2>
        <p className="text-gray-600 mb-6">¡Nuevos gatos se unen a tu colección!</p>
        <div className="overflow-y-auto">
          <div className="flex flex-wrap justify-center gap-4 p-2">
            {newImages.map((image, index) => (
              <div key={image.id} className="flex flex-col items-center animate-popIn w-28" style={{ animationDelay: `${index * 100}ms` }}>
                <img src={image.url} alt={image.theme} className="w-28 h-28 object-cover rounded-lg shadow-md mb-2" />
                <p className="text-sm font-semibold text-gray-700 capitalize">{image.theme}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-full transition-colors"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
};

export default EnvelopeModal;