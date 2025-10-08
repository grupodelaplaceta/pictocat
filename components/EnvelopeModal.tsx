import React from 'react';
import { CatImage } from '../types';
import { CloseIcon } from '../hooks/Icons';

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
    <div className="modal-cartoon-overlay">
      <div className="modal-cartoon-content p-4 sm:p-6 w-full max-w-2xl text-center relative overflow-hidden">
        <Confetti />
        <button onClick={onClose} className="absolute top-2 right-2 bg-seasalt/50 text-liver p-2 rounded-xl border-2 border-liver shadow-sm hover:bg-wheat z-20 transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-liver mb-2">¡Has abierto un {envelopeName}!</h2>
            <p className="text-liver/80 mb-6">¡Nuevos gatos se unen a tu colección!</p>
            <div className="overflow-y-auto max-h-[50vh] bg-wheat p-2 rounded-lg border-2 border-liver/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
                {newImages.map((image, index) => (
                  <div key={image.id} className="flex flex-col items-center animate-popIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="bg-seasalt p-1 rounded-lg shadow-md aspect-square w-full border-2 border-liver/30">
                        <img src={image.url} alt={image.theme} className="w-full h-full object-cover rounded-md" />
                    </div>
                    <p className="mt-2 text-sm font-bold text-liver capitalize">{image.theme}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-6 btn-cartoon btn-cartoon-primary"
            >
              ¡Genial!
            </button>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeModal;