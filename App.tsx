import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import PhraseCard from './components/PhraseCard';
import ImageSelector from './components/ImageSelector';
import FullDisplay from './components/FullDisplay';
import { INITIAL_PHRASES } from './constants';
import { ALL_IMAGES_FLAT, INITIAL_UNLOCKED_IMAGE_IDS } from './initialData';
import { Phrase, CatImage, PlayerStats, EnvelopeTypeId, GameMode, UpgradeId } from './types';
import { speak, soundService } from './services/audioService';
import ShopModal from './components/ShopModal';
import { ENVELOPES, UPGRADES } from './shopData';
import EnvelopeModal from './components/EnvelopeModal';
import Toast from './components/Toast';
import GameModeSelector from './components/GameModeSelector';
import MouseHuntGame from './components/MouseHuntGame';
import CatMemoryGame from './components/CatMemoryGame';
import CustomPhraseModal from './components/CustomPhraseModal';
import { PlusIcon } from './components/Icons';
import FelineRhythmGame from './components/FelineRhythmGame';
import CatTriviaGame from './components/CatTriviaGame';

const App: React.FC = () => {
    // --- State Management ---
    const [phrases, setPhrases] = useState<Phrase[]>([]);
    const [coins, setCoins] = useState<number>(0);
    const [unlockedImageIds, setUnlockedImageIds] = useState<Set<string>>(new Set());
    const [playerStats, setPlayerStats] = useState<PlayerStats>({ level: 1, xp: 0, xpToNextLevel: 100 });
    const [purchasedUpgrades, setPurchasedUpgrades] = useState<Set<UpgradeId>>(new Set());
    
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
    
    // Derived state
    const unlockedImages = useMemo(() => ALL_IMAGES_FLAT.filter(img => unlockedImageIds.has(img.id)), [unlockedImageIds]);
    const imageMap = useMemo(() => new Map(ALL_IMAGES_FLAT.map(img => [img.id, img])), []);

    // --- Data Persistence ---
    const loadData = () => {
        try {
            const savedData = localStorage.getItem('catCommunicatorData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                const savedPhrases = data.phrases || INITIAL_PHRASES;
                const initialPhraseIds = new Set(INITIAL_PHRASES.map(p => p.id));
                // Simple migration for old data that doesn't have isCustom flag
                const migratedPhrases = savedPhrases.map((p: Phrase) => ({
                    ...p,
                    isCustom: p.isCustom !== undefined ? p.isCustom : !initialPhraseIds.has(p.id)
                }));

                setPhrases(migratedPhrases);
                setCoins(data.coins || 500);
                setUnlockedImageIds(new Set(data.unlockedImageIds || INITIAL_UNLOCKED_IMAGE_IDS));
                setPlayerStats(data.playerStats || { level: 1, xp: 0, xpToNextLevel: 100 });
                setPurchasedUpgrades(new Set(data.purchasedUpgrades || []));
            } else {
                // Initialize for first-time players
                setPhrases(INITIAL_PHRASES);
                setCoins(500);
                setUnlockedImageIds(new Set(INITIAL_UNLOCKED_IMAGE_IDS));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    };

    const saveData = useCallback(() => {
        try {
            const data = {
                phrases,
                coins,
                unlockedImageIds: Array.from(unlockedImageIds),
                playerStats,
                purchasedUpgrades: Array.from(purchasedUpgrades),
            };
            localStorage.setItem('catCommunicatorData', JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [phrases, coins, unlockedImageIds, playerStats, purchasedUpgrades]);
    
    useEffect(() => {
        loadData();
        soundService.init();
    }, []);

    useEffect(() => {
        if(phrases.length > 0) { // Only save after initial load
            saveData();
        }
    }, [saveData, phrases.length]);
    
    const showToast = (message: string) => {
        setToastMessage(message);
    }
    
    // --- XP and Leveling ---
    const addXp = useCallback((amount: number) => {
        setPlayerStats(prevStats => {
            let newXp = prevStats.xp + amount;
            let newLevel = prevStats.level;
            let xpToNext = prevStats.xpToNextLevel;

            while (newXp >= xpToNext) {
                newXp -= xpToNext;
                newLevel++;
                xpToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));
                showToast(`¡Subiste al nivel ${newLevel}!`);
                soundService.play('reward');
            }
            return { level: newLevel, xp: newXp, xpToNextLevel: xpToNext };
        });
    }, []);

    // --- Handlers ---
    const handleSelectImageClick = (phraseId: string) => {
        const phrase = phrases.find(p => p.id === phraseId);
        if (phrase) {
            setSelectedPhraseForEditing(phrase);
            setImageSelectorOpen(true);
        }
    };

    const handleImageSelected = (phraseId: string, imageId: string | null) => {
        setPhrases(prevPhrases =>
            prevPhrases.map(p =>
                p.id === phraseId ? { ...p, selectedImageId: imageId } : p
            )
        );
        soundService.play('select');
        setImageSelectorOpen(false);
    };

    const handleDisplay = (phrase: Phrase, image: CatImage | null) => {
        setFullDisplayData({ phrase, image });
    };

    const handlePurchaseEnvelope = (envelopeId: EnvelopeTypeId) => {
        const envelope = ENVELOPES[envelopeId];
        const cost = envelope.baseCost + ((playerStats.level - 1) * envelope.costIncreasePerLevel);
        if (coins < cost) return;

        soundService.play('purchase');
        setCoins(c => c - cost);
        addXp(envelope.xp);
        
        const potentialNewImages = ALL_IMAGES_FLAT.filter(img => !unlockedImageIds.has(img.id));
        potentialNewImages.sort(() => 0.5 - Math.random()); // Shuffle
        const newImages = potentialNewImages.slice(0, envelope.imageCount);
        
        if (newImages.length > 0) {
            setUnlockedImageIds(prevIds => {
                const newIds = new Set(prevIds);
                newImages.forEach(img => newIds.add(img.id));
                return newIds;
            });
            setNewlyUnlockedImages(newImages);
            setOpenedEnvelopeName(envelope.name);
            soundService.play('openEnvelope');
        } else {
            showToast("¡Ya tienes todos los gatos!");
            setCoins(c => c + cost); // Refund if no images are available
        }
    };
    
    const handlePurchaseUpgrade = (upgradeId: UpgradeId) => {
        const upgrade = Object.values(UPGRADES).find(u => u.id === upgradeId);
        if (!upgrade || coins < upgrade.cost || purchasedUpgrades.has(upgradeId) || playerStats.level < upgrade.levelRequired) return;
        
        soundService.play('purchase');
        setCoins(c => c - upgrade.cost);
        setPurchasedUpgrades(prev => new Set(prev).add(upgradeId));
        showToast(`¡Mejora "${upgrade.name}" comprada!`);
    };

    const handleGameEnd = (results: { score: number; coinsEarned: number; xpEarned: number }) => {
        const coinBonus = purchasedUpgrades.has('goldenPaw') ? Math.floor(results.coinsEarned * 0.5) : 0;
        const totalCoins = results.coinsEarned + coinBonus;
        
        setCoins(c => c + totalCoins);
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
        const phrase = phrases.find(p => p.id === phraseId);
        if(phrase) {
            setEditingPhrase(phrase);
            setCustomPhraseModalOpen(true);
        }
    };
    
    const handleSaveCustomPhrase = (phraseData: { text: string; selectedImageId: string | null }) => {
        if (!phraseData.text || !phraseData.selectedImageId) {
            showToast("La frase debe tener texto y una imagen.");
            return;
        }

        if (editingPhrase) { // Update
            setPhrases(prev => prev.map(p => p.id === editingPhrase.id ? { ...p, ...phraseData } : p));
            showToast("Frase actualizada.");
        } else { // Create
            const newPhrase: Phrase = {
                id: `custom_${new Date().getTime()}`,
                text: phraseData.text,
                selectedImageId: phraseData.selectedImageId,
                isCustom: true,
            };
            setPhrases(prev => [newPhrase, ...prev]);
            showToast("Frase creada.");
        }
        soundService.play('select');
        closeCustomPhraseModal();
    };

    const handleDeletePhrase = (phraseId: string) => {
        setPhrases(prev => prev.filter(p => p.id !== phraseId));
        showToast("Frase eliminada.");
        soundService.play('favoriteOff');
        closeCustomPhraseModal();
    };
    
    const renderContent = () => {
        if (view === 'playing' && activeGameMode) {
            const upgrades = {
                betterBait: purchasedUpgrades.has('betterBait'),
                extraTime: purchasedUpgrades.has('extraTime')
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
                {phrases.map(phrase => {
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
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
                aria-label="Crear nueva frase"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
            </>
        )
    };
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <Header
                coins={coins}
                playerLevel={playerStats.level}
                playerXp={playerStats.xp}
                xpToNextLevel={playerStats.xpToNextLevel}
                onOpenShop={() => setView('shop')}
                onOpenGames={() => setView('games')}
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
                    unlockedImageIds={unlockedImageIds}
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
                    coins={coins}
                    playerStats={playerStats}
                    onPurchaseEnvelope={handlePurchaseEnvelope}
                    onPurchaseUpgrade={handlePurchaseUpgrade}
                    purchasedUpgrades={purchasedUpgrades}
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