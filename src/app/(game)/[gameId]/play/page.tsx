'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Player {
  user: {
    name: string;
  };
  score: number;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface Game {
  gameId: string;
  status: string;
  currentQuestion: number;
  questions: Question[];
  players: Player[];
}

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [game, setGame] = useState<Game | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${params.gameId}`);
        if (!response.ok) throw new Error('Game not found');
        
        const gameData = await response.json();
        setGame(gameData);

        if (gameData.status === 'completed') {
          router.push(`/game/${params.gameId}/results`);
        }
      } catch (error) {
        toast.error('Failed to load game');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();

    // Poll for game updates
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [params.gameId, session, router]);

  const submitAnswer = async (answerIndex: number) => {
    if (!game || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    try {
      const response = await fetch(`/api/games/${params.gameId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIndex: game.currentQuestion,
          answer: answerIndex,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      setShowLeaderboard(true);
    } catch (error) {
      toast.error('Failed to submit answer');
      setSelectedAnswer(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Game not found</p>
      </div>
    );
  }

  const currentQuestion = game.questions[game.currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!showLeaderboard ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-center mb-4">
                  Question {game.currentQuestion + 1} of {game.questions.length}
                </h2>
                <p className="text-xl text-center">{currentQuestion.question}</p>
              </div>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg transition-colors ${
                      selectedAnswer === index
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold text-center mb-8">Leaderboard</h2>
              <div className="space-y-4">
                {game.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="text-xl font-bold mr-4">#{index + 1}</span>
                        <span className="text-lg">{player.user.name}</span>
                      </div>
                      <span className="text-xl font-bold">{player.score}</span>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 