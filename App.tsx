import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

// Components
import Header from './hooks/Header';
import PhraseCard from './components/PhraseCard';
import FullDisplay from './components/FullDisplay';
import ImageSelector from './components/ImageSelector';
import ShopModal from './components/ShopModal';
import EnvelopeModal from './components/EnvelopeModal';
import Album from './components/Album';
import CustomPhraseModal from './components/CustomPhraseModal';
import GameModeSelector from './components/GameModeSelector';
import MouseHuntGame from './components/MouseHuntGame';
import CatMemoryGame from './components/CatMemoryGame';
import SimonSaysGame from './components/SimonSaysGame';
import CatTriviaGame from './components/CatTriviaGame';
import FelineRhythmGame from './components/FelineRhythmGame';
import Auth from './components/Auth';
import Toast from './components/Toast';
import AdminPanel from './components/AdminPanel';
import { PlusIcon, CatSilhouetteIcon, SpinnerIcon } from './hooks/Icons';

// Services
import { speak, soundService } from './services/audioService';
import * as api from './services/apiService';
import { useDebounce } from './hooks/useDebounce';

// Types
import { 
  Phrase, CatImage, EnvelopeTypeId, UserProfile, UserData, GameMode, 
  CatMemoryMode, CatTriviaMode, FelineRhythmMode 
} from './types';
import { ENVELOPES, UPGRADES } from './shopData';

// Main App Component
const App: React.FC = () => {
    // State
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<netlifyIdentity.User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const pollingIntervalRef = useRef<number | null>(null);
    // FIX: Initialize catCatalog state to resolve "cannot find name" errors.
    const [catCatalog, setCatCatalog] = useState<CatImage[]>([]);

    // UI State
    type ModalType = 'shop' | 'envelope' | 'imageSelector' | 'album' | 'customPhrase' | 'games' | null;
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    type ViewType = 'main' | 'game' | 'admin';
    const [activeView, setActiveView] = useState<ViewType>('main');
    
    const [displayedPhrase, setDisplayedPhrase] = useState<{ phrase: Phrase; image: CatImage | null } | null>(null);
    const [phraseToSelectImageFor, setPhraseToSelectImageFor] = useState<Phrase | null>(null);
    const [phraseToEdit, setPhraseToEdit] = useState<Phrase | null>(null);
    const [newlyUnlockedImages, setNewlyUnlockedImages] = useState<CatImage[]>([]);
    const [openedEnvelopeName, setOpenedEnvelopeName] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [activeGameMode, setActiveGameMode] = useState<GameMode | null>(null);

    // Derived State
    const unlockedImages = useMemo(() => {
        if (!userProfile?.data || catCatalog.length === 0) return [];
        const unlockedIds = new Set(userProfile.data.unlockedImageIds);
        return catCatalog.filter(img => unlockedIds.has(img.id));
    }, [userProfile?.data, catCatalog]);

    const getImageForPhrase = useCallback((phrase: Phrase): CatImage | null => {
        if (!phrase.selectedImageId) return null;
        return catCatalog.find(img => img.id === phrase.selectedImageId) || null;
    }, [catCatalog]);
    
    const purchasedUpgrades = useMemo(() => new Set(userProfile?.data.purchasedUpgrades || []), [userProfile]);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch catalog first, as it's independent
            const catalog = await api.getCatCatalog();
            setCatCatalog(catalog);

            // Now, fetch user profile if a user is logged in
            if (api.identity.currentUser()) {
                const profile = await api.getUserProfile();
                if (profile) {
                    setUserProfile(profile);
                } else {
                    console.warn("User is logged in, but profile not found on initial load.");
                }
            }
        } catch (error) {
            console.error("Failed to fetch initial data.", error);
            setToastMessage('Error al cargar datos iniciales.');
            // Do not log out, allow polling to handle it
        } finally {
            setIsLoading(false);
        }
    }, []);


    // Effects
    useEffect(() => {
        api.identity.init();
        soundService.init();

        const handleLogin = (loggedInUser: netlifyIdentity.User) => {
            setUser(loggedInUser);
            api.identity.close();
            fetchInitialData();
        };

        const handleLogout = () => {
            setUser(null);
            setUserProfile(null);
            setIsLoading(false);
        };

        api.identity.on('login', handleLogin);
        api.identity.on('logout', handleLogout);
        
        const currentUser = api.identity.currentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        fetchInitialData();


        return () => {
            api.identity.off('login', handleLogin);
            api.identity.off('logout', handleLogout);
        };
    }, [fetchInitialData]);
    
    // Polling effect for new user profile creation
    useEffect(() => {
        // Condition to START polling
        if (user && !userProfile && !isLoading) {
            // To be safe, clear any previous interval before starting a new one.
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            
            console.log("User logged in, but profile is missing. Starting to poll.");
            pollingIntervalRef.current = window.setInterval(async () => {
                console.log("Polling for user profile...");
                try {
                    const profile = await api.getUserProfile();
                    if (profile) {
                        console.log("Profile found!");
                        setUserProfile(profile); // This will cause effect to re-run and stop polling via cleanup.
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 3000);
        }

        // Cleanup function will be called when dependencies change or on unmount.
        // This handles stopping the poll when userProfile is found, or user logs out.
        return () => {
            if (pollingIntervalRef.current) {
                console.log("Stopping polling.");
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [user, userProfile, isLoading]);


    useDebounce(() => {
        if (userProfile?.data) {
            api.saveUserData(userProfile.data);
        }
    }, 1500, [userProfile?.data]);
    
    const updateUserData = (updater: (draft: UserData) => UserData | void) => {
        setUserProfile(currentProfile => {
            if (!currentProfile || !currentProfile.data) return currentProfile;
            
            // Create a deep copy to ensure we don't mutate state directly
            const draft = JSON.parse(JSON.stringify(currentProfile.data));
            const result = updater(draft);
            
            return {
                ...currentProfile,
                data: result || draft,
            };
        });
    };

    // Handlers
    const handleDisplayPhrase = (phrase: Phrase, image: CatImage | null) => {
        setDisplayedPhrase({ phrase, image });
    };

    const handleSelectImageForPhrase = (phraseId: string) => {
        const phrase = userProfile?.data.phrases.find(p => p.id === phraseId);
        if (phrase) {
            setPhraseToSelectImageFor(phrase);
            setActiveModal('imageSelector');
        }
    };
    
    const handleEditPhrase = (phraseId: string) => {
        const phrase = userProfile?.data.phrases.find(p => p.id === phraseId);
        if (phrase) {
            setPhraseToEdit(phrase);
            setActiveModal('customPhrase');
        }
    }

    const handleSaveImageSelection = (phraseId: string, imageId: number | null) => {
        soundService.play('select');
        updateUserData(draft => {
            const phrase = draft.phrases.find(p => p.id === phraseId);
            if (phrase) {
                phrase.selectedImageId = imageId;
            }
        });
        setActiveModal(null);
    };

    const handlePurchaseEnvelope = (envelopeId: EnvelopeTypeId) => {
        if (!userProfile?.data) return;
        const envelope = ENVELOPES[envelopeId];
        const cost = envelope.baseCost + ((userProfile.data.playerStats.level - 1) * envelope.costIncreasePerLevel);

        if (userProfile.data.coins < cost) {
            setToastMessage('¡No tienes suficientes monedas!');
            return;
        }

        const currentUnlockedIds = new Set(userProfile.data.unlockedImageIds);
        const lockedImages = catCatalog.filter(img => !currentUnlockedIds.has(img.id));
        
        if(lockedImages.length === 0) {
            setToastMessage("¡Ya has desbloqueado todos los gatos!");
            return;
        }

        const newImages: CatImage[] = [];
        for (let i = 0; i < envelope.imageCount; i++) {
            if (lockedImages.length > newImages.length) {
                const availableToUnlock = lockedImages.filter(img => !newImages.some(nImg => nImg.id === img.id));
                if (availableToUnlock.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableToUnlock.length);
                    newImages.push(availableToUnlock[randomIndex]);
                }
            }
        }

        if (newImages.length > 0) {
            soundService.play('purchase');
            updateUserData(draft => {
                draft.coins -= cost;
                draft.unlockedImageIds.push(...newImages.map(img => img.id));
                draft.playerStats.xp += envelope.xp;
                // Level up logic
                if (draft.playerStats.xp >= draft.playerStats.xpToNextLevel) {
                    draft.playerStats.level += 1;
                    draft.playerStats.xp -= draft.playerStats.xpToNextLevel;
                    draft.playerStats.xpToNextLevel = Math.floor(draft.playerStats.xpToNextLevel * 1.5);
                }
            });
            setNewlyUnlockedImages(newImages);
            setOpenedEnvelopeName(envelope.name);
            setActiveModal('envelope');
        }
    };
    
    const handlePurchaseUpgrade = (upgradeId: string) => {
        const upgrade = UPGRADES[upgradeId];
        if (!upgrade || !userProfile?.data) return;

        if (userProfile.data.coins >= upgrade.cost && 
            userProfile.data.playerStats.level >= upgrade.levelRequired &&
            !purchasedUpgrades.has(upgrade.id as any)
        ) {
            soundService.play('purchase');
            updateUserData(draft => {
                draft.coins -= upgrade.cost;
                draft.purchasedUpgrades.push(upgrade.id as any);
            });
            setToastMessage(`¡Mejora "${upgrade.name}" comprada!`);
        }
    };
    
    const handleSaveCustomPhrase = async (data: { text: string; selectedImageId: number | null; isPublic: boolean }) => {
        soundService.play('select');
        const phrase = phraseToEdit ? { ...phraseToEdit, ...data } : {
            id: `custom_${Date.now()}`,
            text: data.text,
            selectedImageId: data.selectedImageId,
            isCustom: true,
            isPublic: data.isPublic
        };

        updateUserData(draft => {
            if (phraseToEdit) {
                const index = draft.phrases.findIndex(p => p.id === phraseToEdit.id);
                if (index > -1) draft.phrases[index] = phrase;
            } else {
                draft.phrases.push(phrase);
            }
        });

        // Publish/unpublish phrase
        const image = catCatalog.find(img => img.id === data.selectedImageId);
        if (image) {
            await api.publishPhrase(phrase, image, data.isPublic);
        }

        setActiveModal(null);
        setPhraseToEdit(null);
    };
    
    const handleDeleteCustomPhrase = async (phraseId: string) => {
         soundService.play('favoriteOff');
         const phraseToDelete = userProfile?.data.phrases.find(p => p.id === phraseId);

         updateUserData(draft => {
            draft.phrases = draft.phrases.filter(p => p.id !== phraseId);
         });

         // If it was public, un-publish it
         if (phraseToDelete?.isPublic) {
            const image = catCatalog.find(img => img.id === phraseToDelete.selectedImageId);
            if (image) {
                 await api.publishPhrase(phraseToDelete, image, false);
            }
         }

         setActiveModal(null);
         setPhraseToEdit(null);
    };

    const handleSelectGameMode = (mode: GameMode) => {
        setActiveGameMode(mode);
        setActiveModal(null);
        setActiveView('game');
    };
    
    const handleGameEnd = (results: { score: number, coinsEarned: number, xpEarned: number }) => {
        let finalCoins = results.coinsEarned;
        if (purchasedUpgrades.has('goldenPaw')) {
            finalCoins = Math.ceil(finalCoins * 1.5);
        }
        setToastMessage(`¡Juego terminado! Ganaste ${finalCoins} monedas y ${results.xpEarned} XP.`);
        
        updateUserData(draft => {
            draft.coins += finalCoins;
            draft.playerStats.xp += results.xpEarned;
            if (draft.playerStats.xp >= draft.playerStats.xpToNextLevel) {
                draft.playerStats.level += 1;
                draft.playerStats.xp -= draft.playerStats.xpToNextLevel;
                draft.playerStats.xpToNextLevel = Math.floor(draft.playerStats.xpToNextLevel * 1.5);
            }
        });
        
        setActiveGameMode(null);
        setActiveView('main');
    };
    
    // Render Logic
    if (isLoading && !user) {
        return <div className="fixed inset-0 flex items-center justify-center text-2xl font-bold text-liver">Cargando...</div>;
    }
    
    if (!user) {
        return <Auth />;
    }

    if (!userProfile) {
        // This state appears while the profile is being created automatically via webhook.
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-wheat">
                 <div className="text-center">
                    <SpinnerIcon className="w-12 h-12 animate-spin text-liver mx-auto" />
                    <h1 className="text-2xl font-bold text-liver mt-4">Configurando tu cuenta...</h1>
                    <p className="text-liver/80 mt-2">Esto puede tardar unos segundos. ¡Gracias por tu paciencia!</p>
                </div>
            </div>
        );
    }
    
    const renderGame = () => {
        if (!activeGameMode) return null;
        switch(activeGameMode.gameId) {
            case 'mouseHunt':
                return <MouseHuntGame mode={activeGameMode} upgrades={{ betterBait: purchasedUpgrades.has('betterBait'), extraTime: purchasedUpgrades.has('extraTime') }} onGameEnd={handleGameEnd} />;
            case 'catMemory':
                return <CatMemoryGame mode={activeGameMode as CatMemoryMode} images={unlockedImages} onGameEnd={handleGameEnd} />;
            case 'simonSays':
                return <SimonSaysGame mode={activeGameMode} onGameEnd={handleGameEnd} />;
            case 'catTrivia':
                 return <CatTriviaGame mode={activeGameMode as CatTriviaMode} images={unlockedImages} onGameEnd={handleGameEnd} />;
            case 'felineRhythm':
                return <FelineRhythmGame mode={activeGameMode as FelineRhythmMode} onGameEnd={handleGameEnd} />;
            default:
                return null;
        }
    }
    
    const renderView = () => {
        switch(activeView) {
            case 'game':
                return (
                    <div className="flex-grow flex items-center justify-center p-4">
                        {renderGame()}
                    </div>
                );
            case 'admin':
                return <AdminPanel />;
            case 'main':
            default:
                return (
                     <main className="flex-grow p-4 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {userProfile.data.phrases.map(phrase => (
                            <PhraseCard
                                key={phrase.id}
                                phrase={phrase}
                                image={getImageForPhrase(phrase)}
                                onSelectImage={handleSelectImageForPhrase}
                                onDisplay={handleDisplayPhrase}
                                onSpeak={speak}
                                onEditPhrase={handleEditPhrase}
                            />
                        ))}
                        <button 
                            onClick={() => { setPhraseToEdit(null); setActiveModal('customPhrase'); }}
                            className="card-cartoon-add group"
                        >
                            <PlusIcon className="w-12 h-12 text-liver/30 group-hover:text-buff transition-colors" />
                            <span className="font-bold text-liver/50 group-hover:text-liver transition-colors">Nueva Frase</span>
                        </button>
                    </main>
                )
        }
    }

    return (
        <div className="flex flex-col min-h-screen pt-20">
            <Header
                coins={userProfile.data.coins}
                playerLevel={userProfile.data.playerStats.level}
                playerXp={userProfile.data.playerStats.xp}
                xpToNextLevel={userProfile.data.playerStats.xpToNextLevel}
                onOpenShop={() => setActiveModal('shop')}
                onOpenGames={() => setActiveModal('games')}
                onOpenAdmin={() => { setActiveView('admin'); setActiveModal(null); }}
                currentUser={userProfile.email}
                onLogout={() => api.identity.logout()}
                isAdmin={userProfile.role === 'admin'}
            />

            {renderView()}
            
            <button onClick={() => setActiveModal('album')} className="fixed bottom-4 right-4 bg-uranian_blue text-liver p-4 rounded-full shadow-lg border-4 border-liver z-30 transform hover:scale-110 transition-transform">
                <CatSilhouetteIcon className="w-8 h-8"/>
            </button>

            {/* Modals */}
            {displayedPhrase && (
                <FullDisplay
                    phrase={displayedPhrase.phrase}
                    image={displayedPhrase.image}
                    onClose={() => setDisplayedPhrase(null)}
                />
            )}
            <ImageSelector
                isOpen={activeModal === 'imageSelector'}
                onClose={() => setActiveModal(null)}
                onSelectImage={handleSaveImageSelection}
                phrase={phraseToSelectImageFor}
                unlockedImages={unlockedImages}
            />
            <ShopModal
                isOpen={activeModal === 'shop'}
                onClose={() => setActiveModal(null)}
                coins={userProfile.data.coins}
                playerStats={userProfile.data.playerStats}
                onPurchaseEnvelope={handlePurchaseEnvelope}
                onPurchaseUpgrade={handlePurchaseUpgrade}
                purchasedUpgrades={purchasedUpgrades}
            />
            <EnvelopeModal
                isOpen={activeModal === 'envelope'}
                onClose={() => { setActiveModal(null); soundService.play('openEnvelope'); }}
                newImages={newlyUnlockedImages}
                envelopeName={openedEnvelopeName}
            />
             <Album
                isOpen={activeModal === 'album'}
                onClose={() => setActiveModal(null)}
                unlockedImages={unlockedImages}
            />
            <CustomPhraseModal 
                isOpen={activeModal === 'customPhrase'}
                onClose={() => { setActiveModal(null); setPhraseToEdit(null); }}
                onSave={handleSaveCustomPhrase}
                onDelete={handleDeleteCustomPhrase}
                phraseToEdit={phraseToEdit}
                unlockedImages={unlockedImages}
            />
             <GameModeSelector
                isOpen={activeModal === 'games'}
                onClose={() => setActiveModal(null)}
                onSelectMode={handleSelectGameMode}
                unlockedImagesCount={unlockedImages.length}
            />
            
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </div>
    );
};

export default App;