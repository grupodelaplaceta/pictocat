import React from 'react';
import { CatImage, Phrase } from '../types';
import { CatSilhouetteIcon, CloseIcon } from '../hooks/Icons';

interface FullDisplayProps {
  phrase: Phrase | null;
  image: CatImage | null;
  onClose: () => void;
}

const FullDisplay: React.FC<FullDisplayProps> = ({ phrase, image, onClose }) => {
  if (!phrase) return null;

  return (
    <div className="fixed inset-0 bg-wheat z-50 flex flex-col items-center justify-center p-4 animate-popIn" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-liver/70 hover:text-liver">
        <CloseIcon className="w-10 h-10" />
      </button>
      <div className="w-full max-w-md aspect-square mb-6 flex items-center justify-center">
        {image ? (
            <img src={image.url} alt={phrase.text} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-liver bg-seasalt" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-seasalt rounded-2xl border-4 border-liver">
                <CatSilhouetteIcon className="w-48 h-48 text-wheat" />
            </div>
        )}
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-center text-liver drop-shadow-sm">{phrase.text}</h1>
    </div>
  );
};

export default FullDisplay;