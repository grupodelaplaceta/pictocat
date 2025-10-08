import { CatImage, UserData, UserProfile, AdminUserView, PublicPhrase, Phrase, SearchableUser, PublicProfileData } from '../types';

const BASE_PATH = '/api';

// --- API Helper ---
const authedFetch = async (endpoint: string, token: string, options: RequestInit = {}) => {
    if (!token) {
        throw new Error("Auth token not provided");
    }
    
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${BASE_PATH}/${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error on ${endpoint}: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed on endpoint ${endpoint}. Status: ${response.status}`);
    }

    return response;
};

// --- API Functions ---

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

export const getUserProfile = async (token: string): Promise<UserProfile | null> => {
    try {
        const response = await authedFetch('getUserData', token);
        if (response.status === 404) {
            return null; 
        }
        return await response.json();
    } catch (error) {
        console.error('Get user profile failed:', error);
        throw error;
    }
};

export const saveUserData = async (token: string, data: UserData): Promise<void> => {
     try {
        await authedFetch('saveUserData', token, {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    } catch (error) {
        console.error('Save user data failed:', error);
    }
};

export const searchUsers = async (token: string, query: string): Promise<SearchableUser[]> => {
    try {
        const response = await authedFetch(`search-users?q=${encodeURIComponent(query)}`, token);
        return await response.json();
    } catch (error) {
        console.error('Search users failed:', error);
        return [];
    }
};

export const getPublicProfile = async (token: string, username: string): Promise<PublicProfileData> => {
    const response = await authedFetch(`get-public-profile?username=${encodeURIComponent(username)}`, token);
    return await response.json();
};

export const publishPhrase = async (token: string, phrase: Phrase, image: CatImage, isPublic: boolean): Promise<void> => {
    try {
        await authedFetch('publish-phrase', token, {
            method: 'POST',
            body: JSON.stringify({ phrase, image, isPublic })
        });
    } catch (error) {
        console.error('Publish phrase failed:', error);
    }
};


// --- Admin Functions ---

export const adminGetAllUsers = async (token: string): Promise<AdminUserView[]> => {
    try {
        const response = await authedFetch('admin-get-users', token);
        return await response.json();
    } catch (error) {
        console.error('Admin get users failed:', error);
        return [];
    }
};

export const adminSetVerifiedStatus = async (token: string, userId: string, isVerified: boolean): Promise<boolean> => {
     try {
        await authedFetch('admin-set-verified', token, {
            method: 'POST',
            body: JSON.stringify({ userId, isVerified })
        });
        return true;
    } catch (error) {
        console.error('Admin set verified status failed:', error);
        return false;
    }
};

export const adminGetPublicPhrases = async (token: string): Promise<PublicPhrase[]> => {
     try {
        const response = await authedFetch('admin-get-public-phrases', token);
        return await response.json();
    } catch (error) {
        console.error('Admin get public phrases failed:', error);
        return [];
    }
};

export const adminCensorPhrase = async (token: string, publicPhraseId: number): Promise<boolean> => {
    try {
        await authedFetch('admin-censor-phrase', token, {
            method: 'POST',
            body: JSON.stringify({ publicPhraseId })
        });
        return true;
    } catch (error) {
        console.error('Admin censor phrase failed:', error);
        return false;
    }
};