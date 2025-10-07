import { Envelope, EnvelopeTypeId, GameUpgrade } from './types';

export const ENVELOPES: Record<EnvelopeTypeId, Envelope> = {
  bronze: {
    id: 'bronze',
    name: 'Sobre de Bronce',
    baseCost: 75,
    costIncreasePerLevel: 5,
    imageCount: 1,
    color: 'from-orange-400 to-yellow-500',
    description: 'Una nueva imagen de gato al azar.',
    xp: 10,
  },
  silver: {
    id: 'silver',
    name: 'Sobre de Plata',
    baseCost: 150,
    costIncreasePerLevel: 10,
    imageCount: 3,
    color: 'from-slate-400 to-gray-500',
    description: '¡Tres nuevas imágenes de gatos!',
    xp: 30,
  },
  gold: {
    id: 'gold',
    name: 'Sobre de Oro',
    baseCost: 300,
    costIncreasePerLevel: 20,
    imageCount: 5,
    color: 'from-amber-400 to-yellow-500',
    description: '¡Cinco nuevas imágenes de gatos al azar!',
    xp: 80
  }
};

export const calculateEnvelopeCost = (envelope: Envelope, playerLevel: number): number => {
  return envelope.baseCost + ((playerLevel - 1) * envelope.costIncreasePerLevel);
};

export const UPGRADES: Record<string, GameUpgrade> = {
  goldenPaw: {
    id: 'goldenPaw',
    name: 'Pata Dorada',
    description: 'Aumenta las monedas ganadas en un 50%.',
    cost: 500,
    levelRequired: 3,
    icon: 'coin',
  },
  betterBait: {
    id: 'betterBait',
    name: 'Cebo Mejorado',
    description: 'Los ratones permanecen visibles 250ms más.',
    cost: 350,
    levelRequired: 2,
    icon: 'mouse',
  },
  extraTime: {
    id: 'extraTime',
    name: 'Tiempo Extra',
    description: 'Añade 5 segundos al juego.',
    cost: 700,
    levelRequired: 5,
    icon: 'time'
  }
};