'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function JoinPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [gameId, setGameId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please login first');
      return;
    }

    if (!gameId.trim()) {
      toast.error('Please enter a game ID');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Joined game successfully!');
      router.push(`/game/${gameId}/lobby`);
    } catch (error) {
      toast.error(error.message || 'Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isJoining}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 