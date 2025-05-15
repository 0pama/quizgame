'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function GamePage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${params.gameId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setGame(data);

      // If game hasn't started, redirect to lobby
      if (data.status === 'waiting') {
        router.push(`/game/${params.gameId}/lobby`);
        return;
      }

      // If game is completed, redirect to results
      if (data.status === 'completed') {
        router.push(`/game/${params.gameId}/results`);
        return;
      }

      // Calculate time left for current question
      if (data.startTime) {
        const startTime = new Date(data.startTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        const questionTime = data.timePerQuestion || 30;
        const timeLeft = Math.max(0, questionTime - (elapsedTime % questionTime));
        setTimeLeft(timeLeft);
      }

      // Check if current player has answered
      const currentPlayer = data.players.find(p => p.userId === session?.user?.email);
      if (currentPlayer) {
        const hasAnswered = currentPlayer.answers.some(
          a => a.questionIndex === data.currentQuestion
        );
        setHasAnswered(hasAnswered);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch game');
      router.push('/lobby');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchGame();
      // Poll for updates every second
      const interval = setInterval(fetchGame, 1000);
      return () => clearInterval(interval);
    }
  }, [session, params.gameId, router]);

  const submitAnswer = async (answerIndex) => {
    if (hasAnswered) return;

    try {
      const response = await fetch(`/api/games/${params.gameId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answerIndex,
          questionIndex: game.currentQuestion,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSelectedAnswer(answerIndex);
      setHasAnswered(true);
    } catch (error) {
      toast.error(error.message || 'Failed to submit answer');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const currentQuestion = game.questions[game.currentQuestion];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Question {game.currentQuestion + 1} of {game.questions.length}
              </h3>
              <div className="text-sm font-medium text-gray-500">
                Time left: {timeLeft}s
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xl font-medium text-gray-900 mb-4">
                {currentQuestion.question}
              </h4>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-4 py-3 rounded-lg border ${
                      selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-500'
                    } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {hasAnswered && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Waiting for other players...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 