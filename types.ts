// Fix: Define the types for the application.
export interface Phrase {
  id: string;
  text: string;
  selectedImageId: number | null; // Changed to number to match DB IDs
  isCustom?: boolean;
  isPublic?: boolean;
}

export interface CatImage {
  id: number; // Changed to number (SERIAL PRIMARY KEY from DB)
  url: string;
  theme: string;
}

export type EnvelopeTypeId = 'bronze' | 'silver' | 'gold';

export interface Envelope {
  id: EnvelopeTypeId;
  name: string;
  baseCost: number;
  costIncreasePerLevel: number;
  imageCount: number;
  color: string;
  description: string;
  xp: number;
}

// New Types
export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export type UpgradeId = 'goldenPaw' | 'betterBait' | 'extraTime';

export interface GameUpgrade {
  id: UpgradeId;
  name: string;
  description: string;
  cost: number;
  levelRequired: number;
  icon: 'coin' | 'mouse' | 'time';
}

export interface UserProfile {
  id: string; // From auth provider
  email: string;
  data: UserData;
  isVerified: boolean; 
  role: 'user' | 'admin';
}

export interface UserData {
    phrases: Phrase[];
    coins: number;
    unlockedImageIds: number[];
    playerStats: PlayerStats;
    purchasedUpgrades: UpgradeId[];
}

export interface AdminUserView {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface PublicPhrase {
  publicPhraseId: number;
  userId: string;
  email: string;
  text: string;
  imageUrl: string;
  imageTheme: string;
}

// FIX: Add missing types for public profile and user search features to resolve import errors.
export interface PublicProfilePhrase {
    publicPhraseId: number;
    text: string;
    imageUrl: string;
    imageTheme: string;
}

export interface PublicProfileData {
    username: string;
    isVerified: boolean;
    phrases: PublicProfilePhrase[];
}

export interface SearchableUser {
    username: string;
    isVerified: boolean;
}

// --- Game Mode Types ---

interface BaseGameMode {
  id: string;
  name: string;
  description: string;
  gameDuration: number; // in seconds
}

export interface MouseHuntMode extends BaseGameMode {
  gameId: 'mouseHunt';
  gridSize: number;
  mouseDuration: number;
  maxMice: number;
  rewardMultiplier: number;
}

export interface CatMemoryMode extends BaseGameMode {
  gameId: 'catMemory';
  pairCount: number;
  rewardPerPair: number;
  minImagesRequired: number;
}

export interface SimonSaysMode extends BaseGameMode {
  gameId: 'simonSays';
  initialSequenceLength: number;
  speedMs: number; // time between notes
  rewardPerRound: number;
}

export interface CatTriviaMode extends BaseGameMode {
  gameId: 'catTrivia';
  questionCount: number;
  timePerQuestion: number;
  rewardPerCorrect: number;
  minImagesRequired: number;
}

// FIX: Add FelineRhythmMode type for the FelineRhythmGame component.
export interface FelineRhythmMode extends BaseGameMode {
  gameId: 'felineRhythm';
  noteCount: number;
  rewardMultiplier: number;
}


export type GameMode = MouseHuntMode | CatMemoryMode | SimonSaysMode | CatTriviaMode | FelineRhythmMode;