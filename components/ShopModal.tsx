import React, { useState } from 'react';
import { Envelope, EnvelopeTypeId, PlayerStats, UpgradeId } from '../types';
import { CloseIcon, CoinIcon, EnvelopeIcon, LockIcon, MouseIcon, TimeIcon } from './Icons';
import { ENVELOPES, UPGRADES, calculateEnvelopeCost } from '../shopData';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  playerStats: PlayerStats;
  onPurchaseEnvelope: (envelopeId: EnvelopeTypeId) => void;
  onPurchaseUpgrade: (upgradeId: UpgradeId) => void;
  purchasedUpgrades: Set<UpgradeId>;
}

type Tab = 'envelopes' | 'upgrades';

const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  playerStats,
  onPurchaseEnvelope,
  onPurchaseUpgrade,
  purchasedUpgrades
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('envelopes');
  if (!isOpen) return null;

  const renderEnvelope = (envelope: Envelope) => {
    const cost = calculateEnvelopeCost(envelope, playerStats.level);
    const canAfford = coins >= cost;
    return (
      <div key={envelope.id} className="bg-gray-100 rounded-lg p-4 flex flex-col items-center text-center shadow-sm">
        <div className={`w-24 h-24 mb-4 rounded-full flex items-center justify-center bg-gradient-to-br ${envelope.color}`}>
          <EnvelopeIcon className="w-12 h-12 text-white/80" />
        </div>
        <h3 className="text-lg font-bold">{envelope.name}</h3>
        <p className="text-sm text-gray-600 flex-grow mb-2">{envelope.description}</p>
        <p className="text-sm text-gray-500 mb-4">Recibes {envelope.xp} XP</p>
        <button
          onClick={() => onPurchaseEnvelope(envelope.id)}
          disabled={!canAfford}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          <CoinIcon className="w-5 h-5" />
          <span>{cost}</span>
        </button>
      </div>
    );
  };
  
  const renderUpgrade = (upgrade: typeof UPGRADES[string]) => {
      const isPurchased = purchasedUpgrades.has(upgrade.id);
      const isLocked = playerStats.level < upgrade.levelRequired;
      const canAfford = coins >= upgrade.cost;
      const canPurchase = !isPurchased && !isLocked && canAfford;

      let Icon;
      if (upgrade.icon === 'coin') Icon = CoinIcon;
      else if (upgrade.icon === 'mouse') Icon = MouseIcon;
      else Icon = TimeIcon;

      return (
        <div key={upgrade.id} className="bg-gray-100 rounded-lg p-4 flex gap-4 items-center shadow-sm">
            <div className="bg-orange-500/20 p-3 rounded-full">
                <Icon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-gray-800">{upgrade.name}</h3>
                <p className="text-sm text-gray-600">{upgrade.description}</p>
                 {isLocked && <p className="text-xs text-red-500 font-semibold">Requiere nivel {upgrade.levelRequired}</p>}
            </div>
            {isPurchased ? (
                 <span className="font-bold text-green-600">Comprado</span>
            ) : isLocked ? (
                <div className="flex items-center gap-2 text-gray-500 font-bold py-2 px-4 rounded-full bg-gray-300">
                    <LockIcon className="w-5 h-5"/>
                    <span>{upgrade.cost}</span>
                </div>
            ) : (
                <button 
                    onClick={() => onPurchaseUpgrade(upgrade.id)} 
                    disabled={!canPurchase}
                    className="flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
                >
                    <CoinIcon className="w-5 h-5"/>
                    <span>{upgrade.cost}</span>
                </button>
            )}
        </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Tienda</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-7 h-7" />
          </button>
        </header>

        <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('envelopes')} className={`${activeTab === 'envelopes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Sobres de Gatos
                </button>
                 <button onClick={() => setActiveTab('upgrades')} className={`${activeTab === 'upgrades' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Mejoras de Juegos
                </button>
            </nav>
        </div>

        <main className="flex-grow overflow-y-auto pr-2">
            {activeTab === 'envelopes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.values(ENVELOPES).map(renderEnvelope)}
                </div>
            )}
             {activeTab === 'upgrades' && (
                <div className="flex flex-col gap-4">
                    {Object.values(UPGRADES).map(renderUpgrade)}
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default ShopModal;