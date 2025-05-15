'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function JoinGamePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [gameId, setGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join game');
      }

      toast.success('Joined game successfully!');
      router.push(`/game/${gameId}/lobby`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Please login to join a game</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Join a Game
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the game ID to join
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="gameId" className="sr-only">
              Game ID
            </label>
            <input
              id="gameId"
              name="gameId"
              type="text"
              required
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter Game ID"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 