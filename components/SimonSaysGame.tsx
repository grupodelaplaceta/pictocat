import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimonSaysMode } from '../types';
import { soundService } from '../services/audioService';
import { CatSilhouetteIcon } from '../hooks/Icons';

interface SimonSaysGameProps {
  mode: SimonSaysMode;
  onGameEnd: (results: { score: number; coinsEarned: number; xpEarned: number }) => void;
}

const PAD_COLORS = ['bg-rose-500', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-400'];
const PAD_HOVER_COLORS = ['hover:bg-rose-600', 'hover:bg-emerald-600', 'hover:bg-sky-600', 'hover:bg-amber-500'];
const PAD_ACTIVE_COLORS = ['bg-rose-400', 'bg-emerald-400', 'bg-sky-400', 'bg-amber-300'];
const SOUNDS: ('simon1' | 'simon2' | 'simon3' | 'simon4')[] = ['simon1', 'simon2', 'simon3', 'simon4'];

const SimonSaysGame: React.FC<SimonSaysGameProps> = ({ mode, onGameEnd }) => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [gameState, setGameState] = useState<'watching' | 'playing' | 'gameover'>('watching');
    const [activePad, setActivePad] = useState<number | null>(null);
    const [round, setRound] = useState(0);

    // FIX: Replaced NodeJS.Timeout with number for browser compatibility.
    const timeoutRef = useRef<number | null>(null);

    const nextRound = useCallback(() => {
        setGameState('watching');
        setPlayerSequence([]);
        const nextInSequence = Math.floor(Math.random() * 4);
        const newSequence = [...sequence, nextInSequence];
        setSequence(newSequence);
        
        // Play sequence to user
        newSequence.forEach((padIndex, index) => {
            setTimeout(() => {
                setActivePad(padIndex);
                soundService.play(SOUNDS[padIndex]);
                setTimeout(() => setActivePad(null), mode.speedMs / 2);
            }, (index + 1) * mode.speedMs);
        });

        // Set player turn after sequence finishes
        setTimeout(() => {
            setGameState('playing');
        }, (newSequence.length + 1) * mode.speedMs);

    }, [sequence, mode.speedMs]);

    const startGame = useCallback(() => {
        setSequence([]);
        setPlayerSequence([]);
        setRound(0);
        
        // Use a timeout to allow state to reset before starting first round
        setTimeout(() => {
            nextRound();
        }, 500);

    }, [nextRound]);

    useEffect(() => {
        startGame();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [startGame]);
    
    const handleGameOver = useCallback(() => {
        setGameState('gameover');
        soundService.play('simonError');
        const score = round;
        const coinsEarned = score * mode.rewardPerRound;
        const xpEarned = score * Math.ceil(mode.rewardPerRound / 2);

        setTimeout(() => {
            onGameEnd({ score, coinsEarned, xpEarned });
        }, 2000);
    }, [round, mode.rewardPerRound, onGameEnd]);

    const handlePadClick = (padIndex: number) => {
        if (gameState !== 'playing') return;

        soundService.play(SOUNDS[padIndex]);
        const newPlayerSequence = [...playerSequence, padIndex];
        setPlayerSequence(newPlayerSequence);

        // Check if current move is correct
        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            handleGameOver();
            return;
        }

        // Check if round is complete
        if (newPlayerSequence.length === sequence.length) {
            setRound(prev => prev + 1);
            setTimeout(() => {
                nextRound();
            }, 1000);
        }
    };
    
    let statusMessage = '';
    if (gameState === 'watching') statusMessage = '¡Observa la secuencia!';
    if (gameState === 'playing') statusMessage = '¡Tu turno!';
    if (gameState === 'gameover') statusMessage = '¡Oh no! Fin del juego.';


    return (
        <div className="w-full max-w-md mx-auto p-4 bg-liver rounded-2xl shadow-2xl border-4 border-black text-seasalt select-none flex flex-col items-center">
            <header className="w-full flex justify-between items-center mb-4 font-bold text-lg">
                <h2>Miau Simón</h2>
                <span>Ronda: {round}</span>
            </header>
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-4">
                {PAD_COLORS.map((color, index) => {
                    const rotation = `rotate(${index * 90}deg)`;
                    return (
                        <div key={index} className="absolute w-1/2 h-1/2 origin-bottom-right" style={{ transform: rotation }}>
                            <button
                                onClick={() => handlePadClick(index)}
                                disabled={gameState !== 'playing'}
                                className={`w-full h-full p-2 transition-colors duration-150 transform active:scale-95 disabled:cursor-not-allowed border-4 border-black
                                    ${ index === 0 ? 'rounded-tl-full' : ''}
                                    ${PAD_HOVER_COLORS[index]}
                                    ${activePad === index ? PAD_ACTIVE_COLORS[index] : color}`
                                }
                            />
                        </div>
                    );
                })}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 bg-black/50 rounded-full flex flex-col items-center justify-center text-center p-2 border-4 border-liver">
                    <CatSilhouetteIcon className={`w-12 h-12 mb-1 transition-colors ${gameState === 'gameover' ? 'text-red-500' : 'text-buff'}`} />
                    <p className="text-sm font-bold">{statusMessage}</p>
                </div>
            </div>
        </div>
    );
};

export default SimonSaysGame;