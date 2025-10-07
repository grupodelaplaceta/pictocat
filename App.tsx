import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import PhraseCard from './components/PhraseCard';
import ImageSelector from './components/ImageSelector';
import FullDisplay from './components/FullDisplay';
import { Phrase, CatImage, PlayerStats, EnvelopeTypeId, GameMode, UpgradeId, UserData, UserProfile } from './types';
import { speak, soundService } from './services/audioService';
import ShopModal from './components/ShopModal';
import { ENVELOPES, UPGRADES } from './shopData';
import EnvelopeModal from './components/EnvelopeModal';
import Toast from './components/Toast';
import GameModeSelector from './components/GameModeSelector';
import MouseHuntGame from './components/MouseHuntGame';
import CatMemoryGame from './components/CatMemoryGame';
import CustomPhraseModal from './components/CustomPhraseModal';
import { PlusIcon, SpinnerIcon, CatSilhouetteIcon } from './components/Icons';
import FelineRhythmGame from './components/FelineRhythmGame';
import CatTriviaGame from './components/CatTriviaGame';
import ProfileSetup from './components/ProfileSetup';
import * as apiService from './services/apiService';
import type { User } from 'netlify-identity-widget';


const App: React.FC = () => {
    // --- Auth State ---
    const [netlifyUser, setNetlifyUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- Global Data ---
    const [catCatalog, setCatCatalog] = useState<CatImage[]>([]);

    // --- State Management ---
    const [userData, setUserData] = useState<UserData | null>(null);
    
    const [view, setView] = useState<'main' | 'shop' | 'games' | 'playing'>('main');
    const [activeGameMode, setActiveGameMode] = useState<GameMode | null>(null);

    const [isImageSelectorOpen, setImageSelectorOpen] = useState(false);
    const [selectedPhraseForEditing, setSelectedPhraseForEditing] = useState<Phrase | null>(null);

    const [isCustomPhraseModalOpen, setCustomPhraseModalOpen] = useState(false);
    const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);

    const [fullDisplayData, setFullDisplayData] = useState<{ phrase: Phrase; image: CatImage | null } | null>(null);
    
    const [newlyUnlockedImages, setNewlyUnlockedImages] = useState<CatImage[]>([]);
    const [openedEnvelopeName, setOpenedEnvelopeName] = useState('');
    
    const [toastMessage, setToastMessage] = useState<string>('');
    
    const isReadyToSave = useRef(false);

    // Initialize Netlify Identity and fetch catalog
    useEffect(() => {
        apiService.identity.init();
        soundService.init();

        apiService.identity.on('login', (user) => {
            setNetlifyUser(user);
            apiService.identity.close();
        });

        apiService.identity.on('logout', () => {
            setNetlifyUser(null);
            setUserProfile(null);
            setUserData(null);
        });

        setNetlifyUser(apiService.identity.currentUser());

        const fetchCatalog = async () => {
            const catalog = await apiService.getCatCatalog();
            setCatCatalog(catalog);
        };
        fetchCatalog();

    }, []);

    // Effect to load user profile data when Netlify user is authenticated
    useEffect(() => {
        const loadProfile = async () => {
            if (netlifyUser) {
                isReadyToSave.current = false;
                setIsLoading(true);
                const profile = await apiService.getUserProfile();
                setUserProfile(profile); // Can be null if new user
                setUserData(profile?.data ?? null);
                setIsLoading(false);
                if (profile) {
                   isReadyToSave.current = true;
                }
            } else {
                setIsLoading(false);
            }
        };
        
        if (catCatalog.length > 0) { // Ensure catalog is loaded before profile
            loadProfile();
        }

    }, [netlifyUser, catCatalog]);
    
    // Save data whenever it changes
    useEffect(() => {
        if (!isReadyToSave.current || !netlifyUser || !userData) {
            return;
        }
        apiService.saveUserData(userData);
    }, [userData, netlifyUser]);

    const showToast = (message: string) => {
        setToastMessage(message);
    }

    const updateUserData = useCallback((updater: (prev: UserData) => UserData) => {
        setUserData(prev => {
            if (!prev) return null;
            return updater(prev);
        });
    }, []);
    
    // --- XP and Leveling ---
    const addXp = useCallback((amount: number) => {
        updateUserData(prev => {
            let newXp = prev.playerStats.xp + amount;
            let newLevel = prev.playerStats.level;
            let xpToNext = prev.playerStats.xpToNextLevel;

            while (newXp >= xpToNext) {
                newXp -= xpToNext;
                newLevel++;
                xpToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));
                showToast(`¡Subiste al nivel ${newLevel}!`);
                soundService.play('reward');
            }
            return { ...prev, playerStats: { level: newLevel, xp: newXp, xpToNextLevel: xpToNext } };
        });
    }, [updateUserData]);

    // --- Handlers ---
    const handleSelectImageClick = (phraseId: string) => {
        if(!userData) return;
        const phrase = userData.phrases.find(p => p.id === phraseId);
        if (phrase) {
            setSelectedPhraseForEditing(phrase);
            setImageSelectorOpen(true);
        }
    };

    const handleImageSelected = (phraseId: string, imageId: number | null) => {
        updateUserData(prev => ({
            ...prev,
            phrases: prev.phrases.map(p => p.id === phraseId ? { ...p, selectedImageId: imageId } : p)
        }));
        soundService.play('select');
        setImageSelectorOpen(false);
    };

    const handleDisplay = (phrase: Phrase, image: CatImage | null) => {
        setFullDisplayData({ phrase, image });
    };

    const handlePurchaseEnvelope = (envelopeId: EnvelopeTypeId) => {
        if (!userData) return;
        const envelope = ENVELOPES[envelopeId];
        const cost = envelope.baseCost + ((userData.playerStats.level - 1) * envelope.costIncreasePerLevel);
        if (userData.coins < cost) return;

        soundService.play('purchase');
        const currentUnlockedIds = new Set(userData.unlockedImageIds);
        const potentialNewImages = catCatalog.filter(img => !currentUnlockedIds.has(img.id));
        potentialNewImages.sort(() => 0.5 - Math.random());
        const newImages = potentialNewImages.slice(0, envelope.imageCount);
        
        if (newImages.length > 0) {
            const newImageIds = newImages.map(img => img.id);
            updateUserData(prev => ({
                ...prev,
                coins: prev.coins - cost,
                unlockedImageIds: [...prev.unlockedImageIds, ...newImageIds]
            }));
            addXp(envelope.xp);

            setNewlyUnlockedImages(newImages);
            setOpenedEnvelopeName(envelope.name);
            soundService.play('openEnvelope');
        } else {
            showToast("¡Ya tienes todos los gatos!");
        }
    };
    
    const handlePurchaseUpgrade = (upgradeId: UpgradeId) => {
        if (!userData) return;
        const upgrade = Object.values(UPGRADES).find(u => u.id === upgradeId);
        if (!upgrade || userData.coins < upgrade.cost || userData.purchasedUpgrades.includes(upgradeId) || userData.playerStats.level < upgrade.levelRequired) return;
        
        soundService.play('purchase');
        updateUserData(prev => ({
            ...prev,
            coins: prev.coins - upgrade.cost,
            purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId]
        }));
        showToast(`¡Mejora "${upgrade.name}" comprada!`);
    };

    const handleGameEnd = (results: { score: number; coinsEarned: number; xpEarned: number }) => {
        if(!userData) return;
        const coinBonus = userData.purchasedUpgrades.includes('goldenPaw') ? Math.floor(results.coinsEarned * 0.5) : 0;
        const totalCoins = results.coinsEarned + coinBonus;
        
        updateUserData(prev => ({ ...prev, coins: prev.coins + totalCoins }));
        addXp(results.xpEarned);
        setView('games');
        setActiveGameMode(null);
        showToast(`+${totalCoins} monedas, +${results.xpEarned} XP`);
    };

    // --- Custom Phrase Handlers ---
    const closeCustomPhraseModal = () => {
        setEditingPhrase(null);
        setCustomPhraseModalOpen(false);
    };
    
    const handleOpenCreateModal = () => {
        setEditingPhrase(null);
        setCustomPhraseModalOpen(true);
    };
    
    const handleOpenEditModal = (phraseId: string) => {
        if(!userData) return;
        const phrase = userData.phrases.find(p => p.id === phraseId);
        if(phrase) {
            setEditingPhrase(phrase);
            setCustomPhraseModalOpen(true);
        }
    };
    
    const handleSaveCustomPhrase = (phraseData: { text: string; selectedImageId: number | null }) => {
        if (!phraseData.text || phraseData.selectedImageId === null) {
            showToast("La frase debe tener texto y una imagen.");
            return;
        }

        if (editingPhrase) { // Update
            updateUserData(prev => ({
                ...prev,
                phrases: prev.phrases.map(p => p.id === editingPhrase.id ? { ...p, ...phraseData } : p)
            }));
            showToast("Frase actualizada.");
        } else { // Create
            const newPhrase: Phrase = {
                id: `custom_${new Date().getTime()}`,
                text: phraseData.text,
                selectedImageId: phraseData.selectedImageId,
                isCustom: true,
            };
            updateUserData(prev => ({...prev, phrases: [newPhrase, ...prev.phrases]}));
            showToast("Frase creada.");
        }
        soundService.play('select');
        closeCustomPhraseModal();
    };

    const handleDeletePhrase = (phraseId: string) => {
        updateUserData(prev => ({...prev, phrases: prev.phrases.filter(p => p.id !== phraseId)}));
        showToast("Frase eliminada.");
        soundService.play('favoriteOff');
        closeCustomPhraseModal();
    };

    // Derived state from userData
    const unlockedImages = useMemo(() => {
        if (!userData) return [];
        const unlockedIds = new Set(userData.unlockedImageIds);
        return catCatalog.filter(img => unlockedIds.has(img.id));
    }, [userData, catCatalog]);

    const imageMap = useMemo(() => new Map(catCatalog.map(img => [img.id, img])), [catCatalog]);
    
    const renderContent = () => {
        if (!userData) return null;

        if (view === 'playing' && activeGameMode) {
            const upgrades = {
                betterBait: userData.purchasedUpgrades.includes('betterBait'),
                extraTime: userData.purchasedUpgrades.includes('extraTime')
            };
            if(activeGameMode.gameId === 'mouseHunt') {
                return <MouseHuntGame mode={activeGameMode} upgrades={upgrades} onGameEnd={handleGameEnd} />;
            }
            if(activeGameMode.gameId === 'catMemory') {
                return <CatMemoryGame mode={activeGameMode} images={unlockedImages} onGameEnd={handleGameEnd} />
            }
            if(activeGameMode.gameId === 'felineRhythm') {
                return <FelineRhythmGame mode={activeGameMode} onGameEnd={handleGameEnd} />
            }
            if(activeGameMode.gameId === 'catTrivia') {
                return <CatTriviaGame mode={activeGameMode} images={unlockedImages} onGameEnd={handleGameEnd} />
            }
        }

        return (
            <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {userData.phrases.map(phrase => {
                    const image = phrase.selectedImageId ? imageMap.get(phrase.selectedImageId) ?? null : null;
                    return (
                        <PhraseCard
                            key={phrase.id}
                            phrase={phrase}
                            image={image}
                            onSelectImage={handleSelectImageClick}
                            onDisplay={handleDisplay}
                            onSpeak={speak}
                            onEditPhrase={handleOpenEditModal}
                        />
                    );
                })}
            </div>
            <button
                onClick={handleOpenCreateModal}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 animate-pulse-subtle"
                aria-label="Crear nueva frase"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
            </>
        )
    };
    
    // --- Render Logic ---
    if (isLoading || catCatalog.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-600">
                <SpinnerIcon className="w-12 h-12 animate-spin mb-4" />
                <p className="text-xl font-bold">Cargando PictoCat...</p>
            </div>
        );
    }

    if (!netlifyUser) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center p-4">
                 <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-2xl p-8 text-center">
                    <CatSilhouetteIcon className="w-20 h-20 text-indigo-600 mb-2 mx-auto" />
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter">PictoCat</h1>
                    <p className="text-gray-600 mt-4 mb-8">Un juego de comunicación visual con gatos.</p>
                    <button 
                        onClick={() => apiService.identity.open()}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        Iniciar Sesión o Registrarse
                    </button>
                </div>
            </div>
        );
    }

    if (!userProfile || !userData) {
        return <ProfileSetup onProfileCreated={(profile) => {
            setUserProfile(profile);
            setUserData(profile.data);
            isReadyToSave.current = true;
        }} />;
    }

    return (
        <div className="min-h-screen">
            <Header
                coins={userData.coins}
                playerLevel={userData.playerStats.level}
                playerXp={userData.playerStats.xp}
                xpToNextLevel={userData.playerStats.xpToNextLevel}
                onOpenShop={() => setView('shop')}
                onOpenGames={() => setView('games')}
                currentUser={userProfile.username}
                onLogout={() => apiService.identity.logout()}
            />

            <main className="pt-24 pb-24">
                {renderContent()}
            </main>
            
            {isImageSelectorOpen && (
                 <ImageSelector
                    isOpen={isImageSelectorOpen}
                    onClose={() => setImageSelectorOpen(false)}
                    onSelectImage={handleImageSelected}
                    phrase={selectedPhraseForEditing}
                    unlockedImages={unlockedImages}
                />
            )}
           
            {fullDisplayData && (
                <FullDisplay
                    phrase={fullDisplayData.phrase}
                    image={fullDisplayData.image}
                    onClose={() => setFullDisplayData(null)}
                />
            )}

            {view === 'shop' && (
                <ShopModal
                    isOpen={view === 'shop'}
                    onClose={() => setView('main')}
                    coins={userData.coins}
                    playerStats={userData.playerStats}
                    onPurchaseEnvelope={handlePurchaseEnvelope}
                    onPurchaseUpgrade={handlePurchaseUpgrade}
                    purchasedUpgrades={new Set(userData.purchasedUpgrades)}
                />
            )}
            
            {view === 'games' && (
                <GameModeSelector
                    onClose={() => setView('main')}
                    onSelectMode={(mode) => {
                        setActiveGameMode(mode);
                        setView('playing');
                    }}
                    unlockedImagesCount={unlockedImages.length}
                />
            )}
            
            {isCustomPhraseModalOpen && (
                <CustomPhraseModal
                    isOpen={isCustomPhraseModalOpen}
                    onClose={closeCustomPhraseModal}
                    onSave={handleSaveCustomPhrase}
                    onDelete={handleDeletePhrase}
                    phraseToEdit={editingPhrase}
                    unlockedImages={unlockedImages}
                />
            )}

            {newlyUnlockedImages.length > 0 && (
                <EnvelopeModal
                    isOpen={newlyUnlockedImages.length > 0}
                    onClose={() => setNewlyUnlockedImages([])}
                    newImages={newlyUnlockedImages}
                    envelopeName={openedEnvelopeName}
                />
            )}
            
            {toastMessage && (
                <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            )}
        </div>
    );
};

export default App;