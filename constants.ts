import { Phrase } from './types';

export const INITIAL_COINS = 500;
export const ENVELOPE_COST = 100;
export const IMAGES_PER_ENVELOPE = 3;

export const INITIAL_PHRASES: Phrase[] = [
  { id: 'yes', text: 'Sí', selectedImageId: null, isCustom: false },
  { id: 'no', text: 'No', selectedImageId: null, isCustom: false },
  { id: 'happy', text: 'Me siento feliz', selectedImageId: null, isCustom: false },
  { id: 'sad', text: 'Me siento triste', selectedImageId: null, isCustom: false },
  { id: 'help', text: 'Necesito ayuda', selectedImageId: null, isCustom: false }
];