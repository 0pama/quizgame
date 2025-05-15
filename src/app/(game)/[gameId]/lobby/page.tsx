'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

interface Player {
  user: {
    name: string;
  };
  score: number;
}

interface Game {
  gameId: string;
  host: string;
  status: string;
  players: Player[];
}

export default function GameLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [game, setGame] = useState<Game | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
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

        // Generate QR code
        const url = `${window.location.origin}/join/${params.gameId}`;
        const qr = await QRCode.toDataURL(url);
        setQrCode(qr);
      } catch (error) {
        toast.error('Failed to load game');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();

    // Poll for game updates
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [params.gameId, session, router]);

  const startGame = async () => {
    if (!game) return;

    try {
      const response = await fetch(`/api/games/${params.gameId}/start`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to start game');

      router.push(`/game/${params.gameId}/play`);
    } catch (error) {
      toast.error('Failed to start game');
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

  const isHost = game.host === session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            Game Lobby - {game.gameId}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Players</h2>
              <div className="space-y-2">
                {game.players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span>{player.user.name}</span>
                    <span className="text-gray-500">Score: {player.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4">Join Game</h2>
              <div className="bg-white p-4 rounded-lg shadow">
                <img src={qrCode} alt="Game QR Code" className="w-48 h-48" />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Scan QR code or share game ID: {game.gameId}
              </p>
            </div>
          </div>

          {isHost && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={startGame}
                disabled={game.players.length < 2}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Start Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 