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

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check if player is already in the game
    const isPlayerInGame = game.players.some(
      player => player.userId === session.user.email
    );

    if (isPlayerInGame) {
      return NextResponse.json(
        { error: 'You are already in this game' },
        { status: 400 }
      );
    }

    // Add player to game
    game.players.push({
      userId: session.user.email,
      username: session.user.username,
      score: 0,
      answers: [],
    });

    await game.save();

    return NextResponse.json({ message: 'Joined game successfully' });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
} 