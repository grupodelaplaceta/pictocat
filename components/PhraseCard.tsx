import React from 'react';
import { Phrase, CatImage } from '../types';
import { EditIcon } from './Icons';
import { CatSilhouetteIcon } from './Icons';

interface PhraseCardProps {
  phrase: Phrase;
  image: CatImage | null;
  onSelectImage: (phraseId: string) => void;
  onDisplay: (phrase: Phrase, image: CatImage | null) => void;
  onSpeak: (text: string) => void;
  onEditPhrase: (phraseId: string) => void;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phrase, image, onSelectImage, onDisplay, onSpeak, onEditPhrase }) => {
  const handleCardClick = () => {
    onDisplay(phrase, image);
    onSpeak(phrase.text);
  };

  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (phrase.isCustom) {
          onEditPhrase(phrase.id);
      } else {
          onSelectImage(phrase.id);
      }
  }

  return (
    <div
      className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer aspect-square flex flex-col justify-between overflow-hidden"
      onClick={handleCardClick}
    >
      {image ? (
        <img src={image.url} alt={phrase.text} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-100">
            <CatSilhouetteIcon className="w-24 h-24 text-gray-300" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-white text-center font-semibold text-lg backdrop-blur-sm">
        {phrase.text}
      </div>
      <button
        onClick={handleEditClick}
        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Editar ${phrase.isCustom ? 'frase' : 'imagen para'} ${phrase.text}`}
      >
        <EditIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PhraseCard;