import React, { useState } from 'react';
import { GameMode, CatMemoryMode, CatTriviaMode } from '../types';
import { ArrowLeftIcon, CloseIcon, LockIcon, MouseIcon, BrainIcon, QuestionMarkIcon, CatSilhouetteIcon } from '../hooks/Icons';
import { GAMES_DATA, GAME_MODES } from '../gameData';

interface GameModeSelectorProps {
  isOpen: boolean;
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
  unlockedImagesCount: number;
}

type GameId = 'mouseHunt' | 'catMemory' | 'simonSays' | 'catTrivia';

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ isOpen, onSelectMode, onClose, unlockedImagesCount }) => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  // FIX: Conditionally render based on isOpen prop.
  if (!isOpen) return null;

  const renderGameCard = (gameId: GameId, Icon: React.FC<{className?: string}>, color: string) => (
    <div
      key={gameId}
      onClick={() => setSelectedGame(gameId)}
      className={`card-cartoon p-6 flex flex-col items-center text-center text-liver ${color}`}
    >
      <Icon className="w-16 h-16 mb-4 drop-shadow-md" />
      <h3 className="text-xl font-black drop-shadow-sm">{GAMES_DATA[gameId].name}</h3>
      <p className="mt-2 text-sm">{GAMES_DATA[gameId].description}</p>
    </div>
  );

  const renderModeSelection = () => {
    if (!selectedGame) return null;
    const modes = GAME_MODES.filter(m => m.gameId === selectedGame);
    return (
      <div className="animate-fadeIn">
        <button onClick={() => setSelectedGame(null)} className="flex items-center gap-2 text-liver/70 hover:text-liver mb-4 font-bold">
          <ArrowLeftIcon className="w-5 h-5"/>
          Volver
        </button>
        <h3 className="text-3xl font-black mb-6 text-center text-liver">{GAMES_DATA[selectedGame].name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map(mode => {
            const isMemoryGame = mode.gameId === 'catMemory';
            const isTriviaGame = mode.gameId === 'catTrivia';

            let isLocked = false;
            let requiredImages = 0;

            if (isMemoryGame) {
              const memoryMode = mode as CatMemoryMode;
              requiredImages = memoryMode.minImagesRequired;
              isLocked = unlockedImagesCount < requiredImages;
            } else if (isTriviaGame) {
              const triviaMode = mode as CatTriviaMode;
              requiredImages = triviaMode.minImagesRequired;
              isLocked = unlockedImagesCount < requiredImages;
            }
            
            return (
              <button key={mode.id} 
                className={`p-4 rounded-xl text-left border-2 transition-all transform hover:scale-105 ${isLocked ? 'bg-liver/10 text-liver/40 border-liver/20 cursor-not-allowed' : 'bg-seasalt hover:border-buff hover:shadow-lg cursor-pointer border-liver/30'}`} 
                onClick={() => !isLocked && onSelectMode(mode)}
                disabled={isLocked}
              >
                <h4 className="text-lg font-bold">{mode.name}</h4>
                <p className="text-sm my-1 text-liver/80">{mode.description}</p>
                {isLocked && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-red-500 font-semibold text-sm bg-red-100 p-1 rounded-md">
                        <LockIcon className="w-4 h-4"/>
                        <span>Necesitas {requiredImages} gatos</span>
                    </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-cartoon-overlay">
      <div className="modal-cartoon-content p-4 sm:p-6 w-full max-w-2xl relative overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-liver/70 hover:text-liver z-10">
          <CloseIcon className="w-7 h-7" />
        </button>
        
        {!selectedGame ? (
          <div className="animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl font-black text-liver mb-6 text-center">Seleccionar Juego</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderGameCard('mouseHunt', MouseIcon, 'bg-buff')}
              {renderGameCard('catMemory', CatSilhouetteIcon, 'bg-uranian_blue')}
              {renderGameCard('simonSays', BrainIcon, 'bg-liver text-seasalt')}
              {renderGameCard('catTrivia', QuestionMarkIcon, 'bg-yellow-400')}
            </div>
          </div>
        ) : (
          renderModeSelection()
        )}
      </div>
    </div>
  );
};

export default GameModeSelector;