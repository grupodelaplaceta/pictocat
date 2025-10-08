import React from 'react';
import { CoinIcon, GameIcon, GiftIcon, StarIcon, AdminIcon, UsersIcon, EditIcon } from './Icons';

interface HeaderProps {
  coins: number;
  playerLevel: number;
  playerXp: number;
  xpToNextLevel: number;
  onOpenShop: () => void;
  onOpenGames: () => void;
  onOpenAdmin: () => void;
  onOpenCommunity: () => void;
  onGoToMain: () => void;
  currentUser: string | null;
  onLogout: () => void;
  isAdmin: boolean;
  activeView: 'main' | 'game' | 'admin' | 'community';
}

const Header: React.FC<HeaderProps> = ({ 
    coins, playerLevel, playerXp, xpToNextLevel, 
    onOpenShop, onOpenGames, onOpenAdmin, onOpenCommunity, onGoToMain,
    currentUser, onLogout, isAdmin, activeView
}) => {
  const xpPercentage = xpToNextLevel > 0 ? (playerXp / xpToNextLevel) * 100 : 0;
  // The currentUser prop now contains the @username directly.
  const displayName = currentUser || '';

  const isMainView = activeView === 'main';

  return (
    <header className="fixed top-0 left-0 right-0 bg-seasalt p-2 z-40 flex items-center justify-between text-liver font-bold border-b-4 border-liver">
      {/* Left side: Level and XP */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center gap-1 bg-seasalt w-12 h-12 rounded-full border-2 border-liver">
          <StarIcon className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-black">{playerLevel}</span>
        </div>
        <div className="w-32 md:w-48 hidden sm:block">
          <div className="h-5 bg-wheat rounded-full overflow-hidden border-2 border-liver shadow-inner">
            <div
              className="h-full bg-buff transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center mt-1 font-medium text-liver/70 tracking-wider">{playerXp} / {xpToNextLevel} XP</div>
        </div>
      </div>
      
      {/* Right side: Actions, Coins, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
            {!isMainView && (
                 <button onClick={onGoToMain} className="action-button bg-wheat">
                    <EditIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Mis Frases</span>
                </button>
            )}
            <button onClick={onOpenShop} className="action-button bg-buff">
                <GiftIcon className="w-5 h-5" />
                <span className="hidden md:inline">Tienda</span>
            </button>
            <button onClick={onOpenGames} className="action-button bg-uranian_blue">
                <GameIcon className="w-5 h-5" />
                <span className="hidden md:inline">Juegos</span>
            </button>
             <button onClick={onOpenCommunity} className="action-button bg-wheat">
                <UsersIcon className="w-5 h-5" />
                <span className="hidden md:inline">Comunidad</span>
            </button>
            {isAdmin && (
                <button onClick={onOpenAdmin} className="action-button bg-buff">
                    <AdminIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Admin</span>
                </button>
            )}
            <div className="flex items-center gap-2 bg-seasalt px-3 py-2 rounded-full h-10 border-2 border-liver">
                <CoinIcon className="w-6 h-6 text-yellow-500" />
                <span className="text-lg">{coins}</span>
            </div>
        </div>

        <div className="h-8 w-px bg-liver/20 hidden sm:block"></div>

        <div className="flex items-center gap-3">
            <span className="text-md font-semibold hidden sm:inline">{displayName}</span>
            <button onClick={onLogout} className="btn-cartoon btn-cartoon-danger text-sm px-3 py-2 h-10">
                Salir
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;