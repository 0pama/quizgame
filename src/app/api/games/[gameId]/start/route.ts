import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Game from '@/lib/db/models/Game';

export async function POST(
  req: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const game = await Game.findOne({ gameId: params.gameId });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if user is the host
    if (game.host.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      );
    }

    // Check if there are enough players
    if (game.players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to start' },
        { status: 400 }
      );
    }

    // Update game status
    game.status = 'in-progress';
    game.startTime = new Date();
    game.currentQuestion = 0;
    await game.save();

    return NextResponse.json({
      message: 'Game started successfully',
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
} 