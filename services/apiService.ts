// services/apiService.ts
import { CatImage, UserData, UserProfile } from '../types';
import netlifyIdentity from 'netlify-identity-widget';

const BASE_PATH = '/.netlify/functions';

// --- Netlify Identity Wrapper ---
export const identity = netlifyIdentity;


// --- API Helper ---
const authedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const user = identity.currentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const token = await user.jwt();
    
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    return fetch(`${BASE_PATH}/${endpoint}`, { ...options, headers });
};

// --- API Functions ---

/**
 * Fetches the entire catalog of cat images from the database.
 */
export const getCatCatalog = async (): Promise<CatImage[]> => {
    try {
        const response = await fetch(`${BASE_PATH}/get-catalog`);
        if (!response.ok) throw new Error('Failed to fetch catalog');
        return await response.json();
    } catch (error) {
        console.error('Get cat catalog failed:', error);
        return [];
    }
};

/**
 * Creates a user profile after signup.
 * @param username The chosen unique @username.
 */
export const createProfile = async (username: string): Promise<{ success: boolean; profile?: UserProfile; message?: string }> => {
    try {
        const response = await authedFetch('create-profile', {
            method: 'POST',
            body: JSON.stringify({ username }),
        });
        const data = await response.json();
        if(!response.ok) {
            return { success: false, message: data.message || 'Error creating profile.' };
        }
        return { success: true, profile: data.profile };
    } catch (error) {
        console.error('Create profile failed:', error);
        return { success: false, message: 'A network error occurred.' };
    }
};

/**
 * Fetches the profile and data for the currently logged-in user.
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const response = await authedFetch('get-user-data');
        if (response.status === 404) {
            return null; // New user, no profile yet
        }
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return await response.json();
    } catch (error) {
        console.error('Get user profile failed:', error);
        return null;
    }
};

/**
 * Saves the game data for the currently logged-in user.
 * @param data The complete user game data object.
 */
export const saveUserData = async (data: UserData): Promise<void> => {
     try {
        const response = await authedFetch('save-user-data', {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
        if (!response.ok) {
           throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Save user data failed:', error);
    }
};