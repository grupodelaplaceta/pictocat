// services/apiService.ts
// FIX: Import new types required for community features.
import { CatImage, UserData, UserProfile, AdminUserView, PublicPhrase, Phrase, SearchableUser, PublicProfileData } from '../types';
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

    // FIX: The type definitions for netlify-identity-widget may be out of date.
    // The user object has a jwt() method, so we cast to any to bypass the type error.
    const token = await (user as any).jwt();
    
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
 * Fetches the profile and data for the currently logged-in user.
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const response = await authedFetch('getUserData');
        if (response.status === 404) {
            return null; // New user, no profile yet
        }
        if (!response.ok) {
            // This will be caught by the catch block below
            throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Get user profile failed:', error);
        // Re-throw the error to be handled by the caller
        throw error;
    }
};

/**
 * Saves the game data for the currently logged-in user.
 * @param data The complete user game data object.
 */
export const saveUserData = async (data: UserData): Promise<void> => {
     try {
        const response = await authedFetch('saveUserData', {
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

// FIX: Add a deprecated placeholder function to resolve a compilation error in an unused component.
/**
 * @deprecated This function is a placeholder. User profiles are now created automatically on signup.
 */
export const createProfile = async (): Promise<{ success: boolean; profile?: UserProfile; message?: string; }> => {
    console.warn('`createProfile` is deprecated. Profiles are created automatically via a webhook.');
    return { success: false, message: 'This function is deprecated and should not be used.' };
};

// FIX: Add function to search for users to resolve call error in UserSearch component.
export const searchUsers = async (query: string): Promise<SearchableUser[]> => {
    try {
        const response = await authedFetch(`search-users?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search users');
        return await response.json();
    } catch (error) {
        console.error('Search users failed:', error);
        return [];
    }
};

// FIX: Add function to get a user's public profile data.
export const getPublicProfile = async (username: string): Promise<PublicProfileData> => {
    const response = await authedFetch(`get-public-profile?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('User not found');
        }
        throw new Error('Failed to fetch public profile');
    }
    return await response.json();
};

export const publishPhrase = async (phrase: Phrase, image: CatImage, isPublic: boolean): Promise<void> => {
    try {
        await authedFetch('publish-phrase', {
            method: 'POST',
            body: JSON.stringify({ phrase, image, isPublic })
        });
    } catch (error) {
        console.error('Publish phrase failed:', error);
    }
};


// --- New Admin Functions ---

export const adminGetAllUsers = async (): Promise<AdminUserView[]> => {
    try {
        const response = await authedFetch('admin-get-users');
        if (!response.ok) throw new Error('Failed to fetch users for admin');
        return await response.json();
    } catch (error) {
        console.error('Admin get users failed:', error);
        return [];
    }
};

export const adminSetVerifiedStatus = async (userId: string, isVerified: boolean): Promise<boolean> => {
     try {
        const response = await authedFetch('admin-set-verified', {
            method: 'POST',
            body: JSON.stringify({ userId, isVerified })
        });
        return response.ok;
    } catch (error) {
        console.error('Admin set verified status failed:', error);
        return false;
    }
};

export const adminGetPublicPhrases = async (): Promise<PublicPhrase[]> => {
     try {
        const response = await authedFetch('admin-get-public-phrases');
        if (!response.ok) throw new Error('Failed to fetch public phrases for admin');
        return await response.json();
    } catch (error) {
        console.error('Admin get public phrases failed:', error);
        return [];
    }
};

export const adminCensorPhrase = async (publicPhraseId: number): Promise<boolean> => {
    try {
        const response = await authedFetch('admin-censor-phrase', {
            method: 'POST',
            body: JSON.stringify({ publicPhraseId })
        });
        return response.ok;
    } catch (error) {
        console.error('Admin censor phrase failed:', error);
        return false;
    }
};