import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MouseHuntMode } from '../types';
import { MouseIcon } from '../hooks/Icons';
import { soundService } from '../services/audioService';

interface MouseHuntGameProps {
  mode: MouseHuntMode;
  upgrades: { betterBait: boolean; extraTime: boolean };
  onGameEnd: (results: { score: number; coinsEarned: number; xpEarned: number }) => void;
}

const MouseHuntGame: React.FC<MouseHuntGameProps> = ({ mode, upgrades, onGameEnd }) => {
  const [score, setScore] = useState(0);
  const [mice, setMice] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(mode.gameDuration + (upgrades.extraTime ? 5 : 0));
  const [isFinished, setIsFinished] = useState(false);

  const gameTimeoutRef = useRef<number | null>(null);

  const mouseDuration = mode.mouseDuration + (upgrades.betterBait ? 250 : 0);

  const getRandomHole = useCallback((currentMice: number[]): number => {
    const hole = Math.floor(Math.random() * mode.gridSize);
    return currentMice.includes(hole) ? getRandomHole(currentMice) : hole;
  }, [mode.gridSize]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      if (gameTimeoutRef.current) {
        clearTimeout(gameTimeoutRef.current);
      }
      const coinsEarned = Math.floor(score * mode.rewardMultiplier * 10);
      const xpEarned = Math.floor(score * mode.rewardMultiplier * 5);
      onGameEnd({ score, coinsEarned, xpEarned });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onGameEnd, score, mode.rewardMultiplier]);

  useEffect(() => {
    const spawnMouse = () => {
      if (isFinished) return;
      setMice(prevMice => {
        if (prevMice.length >= mode.maxMice) {
          // Schedule next spawn check
          // Fix: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
          gameTimeoutRef.current = window.setTimeout(spawnMouse, 200);
          return prevMice;
        }
        
        const newMouse = getRandomHole(prevMice);
        const newMice = [...prevMice, newMouse];

        setTimeout(() => {
          setMice(currentMice => currentMice.filter(m => m !== newMouse));
        }, mouseDuration);
        
        // Schedule next spawn
        // Fix: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
        gameTimeoutRef.current = window.setTimeout(spawnMouse, Math.random() * 1000 + 500);
        
        return newMice;
      });
    };

    // Fix: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
    gameTimeoutRef.current = window.setTimeout(spawnMouse, 1000);

    return () => {
      if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
    };
  }, [getRandomHole, mode.maxMice, mouseDuration, isFinished]);

  const onWhack = (holeIndex: number) => {
    if (!mice.includes(holeIndex) || isFinished) return;

    soundService.play('mouseSqueak');
    setScore(prev => prev + 1);
    setMice(prev => prev.filter(m => m !== holeIndex));
  };
  
  const gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(mode.gridSize))}, minmax(0, 1fr))`;

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-wheat rounded-lg shadow-lg border-4 border-liver">
      <div className="flex justify-between items-center mb-4 text-liver font-bold">
        <div className="text-2xl">Puntuación: {score}</div>
        <div className="text-2xl">Tiempo: {timeLeft}s</div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns }}>
        {Array.from({ length: mode.gridSize }).map((_, i) => (
          <div key={i} className="w-full aspect-square bg-buff rounded-full flex items-center justify-center p-2 cursor-pointer" onClick={() => onWhack(i)}>
            <div className="w-full h-full bg-liver rounded-full shadow-inner">
              {mice.includes(i) && (
                <div className="w-full h-full flex items-center justify-center animate-popIn">
                  <MouseIcon className="w-3/4 h-3/4 text-gray-300"/>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MouseHuntGame;