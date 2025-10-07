import React from 'react';
import { CatImage } from '../types';
import { CloseIcon } from './Icons';

const Confetti: React.FC = () => {
  const confettiCount = 70;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: confettiCount }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 2 + 3}s`, // 3s to 5s
          animationDelay: `${Math.random() * 2}s`,
          backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        };
        return <div key={i} className="confetti-piece" style={style}></div>;
      })}
    </div>
  );
};

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
      <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-2xl text-center relative max-h-[90vh] flex flex-col overflow-hidden">
        <Confetti />
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-20">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">¡Has abierto un {envelopeName}!</h2>
            <p className="text-gray-600 mb-6">¡Nuevos gatos se unen a tu colección!</p>
            <div className="overflow-y-auto max-h-[50vh]">
              <div className="flex flex-wrap justify-center gap-4 p-2">
                {newImages.map((image, index) => (
                  <div key={image.id} className="flex flex-col items-center animate-popIn w-28" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="bg-slate-200 p-1 rounded-lg shadow-md">
                        <img src={image.url} alt={image.theme} className="w-28 h-28 object-cover rounded-md" />
                    </div>
                    <p className="mt-2 text-sm font-bold text-gray-700 capitalize">{image.theme}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
            >
              ¡Genial!
            </button>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeModal;