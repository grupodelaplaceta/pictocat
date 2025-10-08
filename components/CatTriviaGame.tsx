import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CatTriviaMode, CatImage } from '../types';
import { soundService } from '../services/audioService';

interface CatTriviaGameProps {
  mode: CatTriviaMode;
  images: CatImage[];
  onGameEnd: (results: { score: number; coinsEarned: number; xpEarned: number }) => void;
}

interface TriviaQuestion {
  image: CatImage;
  options: string[];
  correctAnswer: string;
}

// Fisher-Yates shuffle algorithm
// The generic arrow function syntax can cause parsing issues in .tsx files.
// Changed to a standard function declaration for better type inference compatibility.
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const CatTriviaGame: React.FC<CatTriviaGameProps> = ({ mode, images, onGameEnd }) => {
    const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(mode.timePerQuestion);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        const generateQuestions = () => {
            // FIX: Explicitly type `allThemes` as `string[]`. The type inference was failing,
            // causing `wrongAnswers` to be typed as `unknown[]`, which resulted in the error on line 51.
            const allThemes: string[] = Array.from(new Set(images.map(img => img.theme)));
            // Fix: Explicitly provide the generic type to shuffleArray.
            // TypeScript's type inference for this generic function seems to be failing
            // in this context, causing downstream type errors.
            const shuffledImages = shuffleArray<CatImage>(images);
            const generatedQs: TriviaQuestion[] = [];

            for (let i = 0; i < mode.questionCount && i < shuffledImages.length; i++) {
                const imageForQ = shuffledImages[i];
                const correctAnswer = imageForQ.theme;
                const wrongAnswers = allThemes.filter(theme => theme !== correctAnswer);
                // Fix: Explicitly providing the generic type `<string>` to `shuffleArray` to avoid type inference issues.
                const shuffledWrong = shuffleArray<string>(wrongAnswers).slice(0, 3);
                // Fix: Explicitly provide the generic type argument to `shuffleArray` to resolve the type error.
                const options = shuffleArray<string>([correctAnswer, ...shuffledWrong]);
                generatedQs.push({ image: imageForQ, options, correctAnswer });
            }
            setQuestions(generatedQs);
        };
        generateQuestions();
    }, [images, mode.questionCount]);

    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(mode.timePerQuestion);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            // Game over
            const coins = score * mode.rewardPerCorrect;
            const xp = Math.round(score * (mode.rewardPerCorrect / 2));
            soundService.play('reward');
            onGameEnd({ score, coinsEarned: coins, xpEarned: xp });
        }
    }, [currentQuestionIndex, questions.length, mode.timePerQuestion, score, mode.rewardPerCorrect, onGameEnd]);

    useEffect(() => {
        if (isAnswered) return;
        if (timeLeft <= 0) {
            setIsAnswered(true);
            soundService.play('gameOver');
            setTimeout(nextQuestion, 1500);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isAnswered, nextQuestion]);

    const handleAnswer = (answer: string) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswer(answer);
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
            soundService.play('catMeow');
        } else {
            soundService.play('favoriteOff');
        }
        setTimeout(nextQuestion, 1500);
    };

    if (questions.length === 0) {
        return <div className="text-center p-8 font-bold text-liver">Cargando preguntas...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const timePercentage = (timeLeft / mode.timePerQuestion) * 100;

    return (
        <div className="w-full max-w-xl mx-auto p-4 bg-wheat rounded-lg shadow-lg border-4 border-liver text-liver">
            <header className="flex justify-between items-center mb-4 font-bold">
                <div className="text-lg">Pregunta: {currentQuestionIndex + 1} / {questions.length}</div>
                <div className="text-lg">Puntuación: {score}</div>
            </header>
            
            <div className="w-full h-3 bg-buff/50 rounded-full mb-4 overflow-hidden">
                <div 
                    className="h-full bg-buff transition-all duration-1000 linear" 
                    style={{width: `${timePercentage}%`}}
                />
            </div>

            <div className="bg-seasalt p-4 rounded-lg shadow-md mb-4">
                <p className="text-center font-semibold text-xl mb-4">¿A qué tema pertenece este gato?</p>
                <div className="w-full h-64 rounded-lg overflow-hidden flex items-center justify-center bg-wheat">
                    <img src={currentQuestion.image.url} alt="Gato misterioso" className="max-w-full max-h-full object-contain" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map(option => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedAnswer;
                    let buttonClass = 'bg-seasalt hover:bg-wheat border-buff';
                    if (isAnswered) {
                        if (isCorrect) {
                            buttonClass = 'bg-green-500 text-white border-green-600 scale-105';
                        } else if (isSelected) {
                            buttonClass = 'bg-red-500 text-white border-red-600';
                        } else {
                            buttonClass = 'bg-slate-300 opacity-60 border-slate-400';
                        }
                    }
                    return (
                        <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={isAnswered}
                            className={`p-4 rounded-lg font-bold text-center transition-all duration-300 transform disabled:cursor-not-allowed border-b-4 ${buttonClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default CatTriviaGame;