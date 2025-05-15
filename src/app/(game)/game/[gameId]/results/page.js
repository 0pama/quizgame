'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function ResultsPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${params.gameId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setGame(data);

        // If game hasn't started or is in progress, redirect to appropriate page
        if (data.status === 'waiting') {
          router.push(`/game/${params.gameId}/lobby`);
          return;
        }
        if (data.status === 'in-progress') {
          router.push(`/game/${params.gameId}`);
          return;
        }
      } catch (error) {
        toast.error(error.message || 'Failed to fetch game');
        router.push('/lobby');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchGame();
    }
  }, [session, params.gameId, router]);

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

  // Sort players by score
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-3 py-4 sm:px-6 sm:py-5">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
              Game Results
            </h3>

            <div className="space-y-2 sm:space-y-4">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.userId}
                  className="flex items-center justify-between p-2 sm:p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-base sm:text-lg font-medium text-gray-900 mr-2 sm:mr-4">
                      #{index + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      {player.username}
                      {player.userId === game.host && (
                        <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                          Host
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    {player.score} / {game.questions.length}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={() => router.push('/lobby')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 