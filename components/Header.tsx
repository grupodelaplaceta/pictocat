import React from 'react';
import { CoinIcon, GameIcon, GiftIcon, StarIcon } from './Icons';

interface HeaderProps {
  coins: number;
  playerLevel: number;
  playerXp: number;
  xpToNextLevel: number;
  onOpenShop: () => void;
  onOpenGames: () => void;
  currentUser: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ coins, playerLevel, playerXp, xpToNextLevel, onOpenShop, onOpenGames, currentUser, onLogout }) => {
  const xpPercentage = xpToNextLevel > 0 ? (playerXp / xpToNextLevel) * 100 : 0;

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm shadow-lg p-2 z-40 flex items-center justify-between text-white font-bold">
      {/* Left side: Level and XP */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center gap-2 bg-black/20 w-12 h-12 rounded-full border-2 border-slate-500">
          <StarIcon className="w-6 h-6 text-yellow-300" />
          <span className="text-xl font-black">{playerLevel}</span>
        </div>
        <div className="w-32 md:w-48">
          <div className="h-4 bg-black/30 rounded-full overflow-hidden border border-white/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center mt-1 font-normal text-slate-300 tracking-wider">{playerXp} / {xpToNextLevel} XP</div>
        </div>
      </div>
      
      {/* Right side: Actions, Coins, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
            <button onClick={onOpenShop} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 transition-colors px-4 py-2 rounded-full shadow-lg">
                <GiftIcon className="w-5 h-5" />
                <span className="hidden md:inline">Tienda</span>
            </button>
            <button onClick={onOpenGames} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 transition-colors px-4 py-2 rounded-full shadow-lg">
                <GameIcon className="w-5 h-5" />
                <span className="hidden md:inline">Juegos</span>
            </button>
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full">
                <CoinIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-lg">{coins}</span>
            </div>
        </div>

        <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

        <div className="flex items-center gap-3">
            <span className="text-md font-semibold hidden sm:inline text-slate-300">{currentUser}</span>
            <button onClick={onLogout} className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full shadow-lg">
                Salir
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;