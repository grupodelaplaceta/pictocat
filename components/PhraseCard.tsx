import React from 'react';
import { Phrase, CatImage } from '../types';
import { EditIcon, GlobeIcon, CatSilhouetteIcon } from '../hooks/Icons';

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
      className="card-cartoon group relative aspect-square flex flex-col justify-between overflow-hidden"
      onClick={handleCardClick}
    >
      {image ? (
        <img src={image.url} alt={phrase.text} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      ) : (
        <div className="flex-grow flex items-center justify-center bg-seasalt p-4">
            <CatSilhouetteIcon className="w-full h-full text-wheat" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <p className="font-bold text-lg drop-shadow-md text-center">{phrase.text}</p>
      </div>
      <button
        onClick={handleEditClick}
        className="absolute top-2 right-2 bg-seasalt text-liver p-2 rounded-xl border-2 border-liver shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 hover:bg-yellow-200"
        aria-label={`Editar ${phrase.isCustom ? 'frase' : 'imagen para'} ${phrase.text}`}
      >
        <EditIcon className="w-5 h-5" />
      </button>
       {phrase.isPublic && (
        <div className="absolute top-2 left-2 bg-uranian_blue text-white p-1.5 rounded-full border-2 border-white/50" title="Esta frase es pública">
          <GlobeIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default PhraseCard;