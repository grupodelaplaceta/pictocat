// netlify/functions/_shared/data.ts

// Redefine types here to keep backend self-contained
export interface Phrase {
  id: string;
  text: string;
  selectedImageId: number | null;
  isCustom?: boolean;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export type UpgradeId = 'goldenPaw' | 'betterBait' | 'extraTime';

export interface UserData {
    phrases: Phrase[];
    coins: number;
    unlockedImageIds: number[];
    playerStats: PlayerStats;
    purchasedUpgrades: UpgradeId[];
}

// Backend constants
const INITIAL_PHRASES: Phrase[] = [
  { id: 'yes', text: 'Sí', selectedImageId: null, isCustom: false },
  { id: 'no', text: 'No', selectedImageId: null, isCustom: false },
  { id: 'happy', text: 'Me siento feliz', selectedImageId: null, isCustom: false },
  { id: 'sad', text: 'Me siento triste', selectedImageId: null, isCustom: false },
  { id: 'help', text: 'Necesito ayuda', selectedImageId: null, isCustom: false }
];

const INITIAL_UNLOCKED_IMAGE_IDS: number[] = [];

// Backend function to generate initial user data
export const getInitialUserData = (): UserData => ({
    phrases: INITIAL_PHRASES,
    coins: 500,
    unlockedImageIds: INITIAL_UNLOCKED_IMAGE_IDS,
    playerStats: { level: 1, xp: 0, xpToNextLevel: 100 },
    purchasedUpgrades: [],
});