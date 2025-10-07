import React from 'react';
import { CoinIcon, GameIcon, GiftIcon, StarIcon } from './Icons';

interface HeaderProps {
  coins: number;
  playerLevel: number;
  playerXp: number;
  xpToNextLevel: number;
  onOpenShop: () => void;
  onOpenGames: () => void;
}

const Header: React.FC<HeaderProps> = ({ coins, playerLevel, playerXp, xpToNextLevel, onOpenShop, onOpenGames }) => {
  const xpPercentage = xpToNextLevel > 0 ? (playerXp / xpToNextLevel) * 100 : 0;

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-600/80 backdrop-blur-sm shadow-md p-2 z-40 flex items-center justify-between text-white font-bold">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
          <StarIcon className="w-6 h-6 text-yellow-300" />
          <span className="text-lg">{playerLevel}</span>
        </div>
        <div className="w-32 md:w-48">
          <div className="h-5 bg-black/20 rounded-full overflow-hidden border-2 border-white/50">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center mt-0.5">{playerXp} / {xpToNextLevel} XP</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenShop} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 transition-colors px-3 py-1.5 rounded-full shadow-lg">
          <GiftIcon className="w-5 h-5" />
          <span className="hidden md:inline">Tienda</span>
        </button>
         <button onClick={onOpenGames} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 transition-colors px-3 py-1.5 rounded-full shadow-lg">
          <GameIcon className="w-5 h-5" />
          <span className="hidden md:inline">Juegos</span>
        </button>
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
          <CoinIcon className="w-6 h-6 text-yellow-400" />
          <span className="text-lg">{coins}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
