import React, { useState } from 'react';
import { GameMode, CatMemoryMode, CatTriviaMode } from '../types';
import { ArrowLeftIcon, CloseIcon, LockIcon, MouseIcon, MusicNoteIcon, QuestionMarkIcon } from './Icons';
import { GAMES_DATA, GAME_MODES } from '../gameData';
import { CatSilhouetteIcon } from './Icons';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
  unlockedImagesCount: number;
}

type GameId = 'mouseHunt' | 'catMemory' | 'felineRhythm' | 'catTrivia';

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelectMode, onClose, unlockedImagesCount }) => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const renderGameCard = (gameId: GameId, Icon: React.FC<{className?: string}>, color: string) => (
    <div
      key={gameId}
      onClick={() => setSelectedGame(gameId)}
      className={`p-6 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center bg-gradient-to-br ${color}`}
    >
      <Icon className="w-16 h-16 text-white mb-4 drop-shadow-md" />
      <h3 className="text-xl font-black text-white drop-shadow-sm">{GAMES_DATA[gameId].name}</h3>
      <p className="text-white/90 mt-2 text-sm">{GAMES_DATA[gameId].description}</p>
    </div>
  );

  const renderModeSelection = () => {
    if (!selectedGame) return null;
    const modes = GAME_MODES.filter(m => m.gameId === selectedGame);
    return (
      <div>
        <button onClick={() => setSelectedGame(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 font-bold">
          <ArrowLeftIcon className="w-5 h-5"/>
          Volver
        </button>
        <h3 className="text-3xl font-black mb-6 text-center text-slate-800">{GAMES_DATA[selectedGame].name}</h3>
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
                className={`p-4 rounded-lg text-center border-2 transition-all transform hover:scale-105 ${isLocked ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' : 'bg-white hover:border-indigo-500 hover:shadow-lg cursor-pointer border-slate-200'}`} 
                onClick={() => !isLocked && onSelectMode(mode)}
                disabled={isLocked}
              >
                <h4 className="text-lg font-bold">{mode.name}</h4>
                <p className="text-sm my-2 text-slate-600">{mode.description}</p>
                {isLocked && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-red-500 font-semibold text-sm">
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-100 rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 z-10">
          <CloseIcon className="w-7 h-7" />
        </button>
        
        {!selectedGame ? (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 text-center">Seleccionar Juego</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderGameCard('mouseHunt', MouseIcon, 'from-orange-500 to-amber-500')}
              {renderGameCard('catMemory', CatSilhouetteIcon, 'from-sky-500 to-cyan-500')}
              {renderGameCard('felineRhythm', MusicNoteIcon, 'from-purple-500 to-indigo-500')}
              {renderGameCard('catTrivia', QuestionMarkIcon, 'from-lime-500 to-green-500')}
            </div>
          </>
        ) : (
          renderModeSelection()
        )}
      </div>
    </div>
  );
};

export default GameModeSelector;