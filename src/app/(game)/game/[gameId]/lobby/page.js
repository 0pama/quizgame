'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react'; // for canvas-based QR

export default function LobbyPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${params.gameId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setGame(data);
      setIsHost(data.host === session?.user?.email);

      // Only redirect if game has started or is completed
      if (data.status === 'in-progress') {
        router.push(`/game/${params.gameId}`);
        return;
      }
      if (data.status === 'completed') {
        router.push(`/game/${params.gameId}/results`);
        return;
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
      // Poll for updates every 2 seconds
      const interval = setInterval(fetchGame, 2000);
      return () => clearInterval(interval);
    }
  }, [session, params.gameId, router]);

  const startGame = async () => {
    try {
      const response = await fetch(`/api/games/${params.gameId}/start`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Game started!');
      router.push(`/game/${params.gameId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to start game');
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

  const joinUrl = `${window.location.origin}/join/${game.gameId}`;

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-3 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Game Lobby
              </h3>
              <div className="text-xs sm:text-sm text-gray-500">
                Game ID: {game.gameId}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                Players ({game.players.length})
              </h4>
              <div className="space-y-2">
                {game.players.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      {player.username}
                      {player.userId === game.host && (
                        <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                          Host
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                Join Game
              </h4>
              <div className="flex flex-col items-center">
                <QRCodeCanvas value={joinUrl} size={200} />
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  Scan to join the game
                </p>
              </div>
            </div>

            {isHost && (
              <div className="flex justify-center">
                <button
                  onClick={startGame}
                  disabled={game.players.length < 2}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white ${
                    game.players.length < 2
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {game.players.length < 2 ? 'Need at least 2 players' : 'Start Game'}
                </button>
              </div>
            )}

            {!isHost && (
              <div className="text-center text-xs sm:text-sm text-gray-500">
                Waiting for host to start the game...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 