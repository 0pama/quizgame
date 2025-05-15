import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import { Game } from '@/lib/models/Game';

export async function POST(req, { params }) {
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

    if (game.host !== session.user.email) {
      return NextResponse.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      );
    }

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    if (game.players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to start' },
        { status: 400 }
      );
    }

    game.status = 'in-progress';
    game.startTime = new Date();
    await game.save();

    return NextResponse.json({ message: 'Game started successfully' });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
} 