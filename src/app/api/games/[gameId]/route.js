import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import { Game } from '@/lib/models/Game';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { gameId } = params;

    await connectDB();

    const game = await Game.findOne({ gameId });
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the game
    const isPlayerInGame = game.players.some(
      player => player.userId === session.user.email
    );
    const isHost = game.host === session.user.email;

    if (!isPlayerInGame && !isHost) {
      return NextResponse.json(
        { error: 'You are not part of this game' },
        { status: 403 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
} 