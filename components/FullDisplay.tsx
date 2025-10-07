import React from 'react';
import { CatImage, Phrase } from '../types';
import { CatSilhouetteIcon, CloseIcon } from './Icons';

interface FullDisplayProps {
  phrase: Phrase | null;
  image: CatImage | null;
  onClose: () => void;
}

const FullDisplay: React.FC<FullDisplayProps> = ({ phrase, image, onClose }) => {
  if (!phrase) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
        <CloseIcon className="w-10 h-10" />
      </button>
      <div className="w-full max-w-md aspect-square mb-6 flex items-center justify-center">
        {image ? (
            <img src={image.url} alt={phrase.text} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <CatSilhouetteIcon className="w-48 h-48 text-gray-300" />
            </div>
        )}
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800">{phrase.text}</h1>
    </div>
  );
};

export default FullDisplay;