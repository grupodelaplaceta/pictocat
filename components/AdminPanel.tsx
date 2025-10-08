import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from '../services/apiService';
import { AdminUserView, PublicPhrase } from '../types';
import { SearchIcon, SpinnerIcon, TrashIcon, VerifiedIcon } from '../hooks/Icons';

type AdminTab = 'users' | 'content';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [users, setUsers] = useState<AdminUserView[]>([]);
    const [phrases, setPhrases] = useState<PublicPhrase[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [userData, phraseData] = await Promise.all([
                apiService.adminGetAllUsers(),
                apiService.adminGetPublicPhrases()
            ]);
            setUsers(userData);
            setPhrases(phraseData);
        } catch (e) {
            setError('Failed to load admin data. You might not have permission.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
        const success = await apiService.adminSetVerifiedStatus(userId, !currentStatus);
        if (success) {
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u)
            );
        }
    };

    const handleCensorPhrase = async (publicPhraseId: number) => {
        const success = await apiService.adminCensorPhrase(publicPhraseId);
        if (success) {
            setPhrases(prevPhrases => prevPhrases.filter(p => p.publicPhraseId !== publicPhraseId));
        }
    };

    const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPhrases = phrases.filter(p => 
        p.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderUserManagement = () => (
        <div className="space-y-2">
            {filteredUsers.map(user => (
                <div key={user.id} className="card-cartoon p-3 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{user.email}</span>
                            {user.isVerified && <VerifiedIcon className="w-5 h-5 text-blue-500" />}
                        </div>
                        <span className="text-sm text-liver/70">{user.role}</span>
                    </div>
                    <button
                        onClick={() => handleToggleVerified(user.id, user.isVerified)}
                        className={`px-3 py-1 text-sm rounded-lg font-bold transition-colors ${
                            user.isVerified
                                ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                                : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                        }`}
                    >
                        {user.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                </div>
            ))}
        </div>
    );
    
    const renderContentModeration = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPhrases.map(phrase => (
                 <div key={phrase.publicPhraseId} className="card-cartoon overflow-hidden flex flex-col">
                    <img src={phrase.imageUrl} alt={phrase.text} className="w-full h-40 object-cover border-b-2 border-liver/20"/>
                    <div className="p-3 flex-grow flex flex-col">
                        <p className="font-bold text-lg flex-grow">"{phrase.text}"</p>
                        <p className="text-sm text-liver/70 mt-2">By: {phrase.email}</p>
                         <p className="text-xs text-liver/50">Theme: {phrase.imageTheme}</p>
                    </div>
                    <button
                        onClick={() => handleCensorPhrase(phrase.publicPhraseId)}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold p-2 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5"/> Censor
                    </button>
                 </div>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <SpinnerIcon className="w-10 h-10 animate-spin text-liver" />
            </div>
        );
    }
    
    if (error) {
         return <p className="text-center text-red-500 font-bold p-10">{error}</p>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <h1 className="text-3xl font-black text-liver mb-6">Admin Panel</h1>

            <div className="border-b-2 border-liver/20 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-buff text-liver' : 'border-transparent text-liver/70 hover:text-liver hover:border-liver/30'} whitespace-nowrap py-3 px-1 border-b-4 font-bold text-lg`}>
                        User Management ({users.length})
                    </button>
                    <button onClick={() => setActiveTab('content')} className={`${activeTab === 'content' ? 'border-buff text-liver' : 'border-transparent text-liver/70 hover:text-liver hover:border-liver/30'} whitespace-nowrap py-3 px-1 border-b-4 font-bold text-lg`}>
                        Content Moderation ({phrases.length})
                    </button>
                </nav>
            </div>

            <div className="relative mb-4">
                 <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-cartoon pl-10"
                 />
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-liver/40" />
            </div>

            <div className="bg-wheat p-3 rounded-lg border-2 border-liver/20">
                {activeTab === 'users' ? renderUserManagement() : renderContentModeration()}
            </div>
        </div>
    );
};

export default AdminPanel;