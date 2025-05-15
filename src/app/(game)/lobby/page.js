'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [gameId, setGameId] = useState('');

  const createGame = async () => {
    if (!session) {
      toast.error('Please login first');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: [
            {
              question: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: 1,
            },
            {
              question: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correctAnswer: 2,
            },
          ],
          timePerQuestion: 30,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Game created!');
      router.push(`/game/${data.gameId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create game');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please login first');
      return;
    }

    if (!gameId.trim()) {
      toast.error('Please enter a game ID');
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Joined game!');
      router.push(`/game/${gameId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to join game');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quiz Game Lobby
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <button
                onClick={createGame}
                disabled={isCreating}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isCreating ? 'Creating...' : 'Create New Game'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or join a game</span>
              </div>
            </div>

            <form onSubmit={joinGame} className="space-y-6">
              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-700">
                  Game ID
                </label>
                <div className="mt-1">
                  <input
                    id="gameId"
                    name="gameId"
                    type="text"
                    required
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter game ID"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Join Game
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 