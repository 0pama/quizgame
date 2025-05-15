import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Game from '@/lib/db/models/Game';

export async function GET(
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

    const game = await Game.findOne({ gameId: params.gameId })
      .populate('host', 'name')
      .populate('players.user', 'name');

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
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

    // Check if user is already in the game
    const isPlayer = game.players.some(
      (player) => player.user.toString() === session.user.id
    );

    if (!isPlayer) {
      game.players.push({
        user: session.user.id,
        score: 0,
        answers: [],
      });
      await game.save();
    }

    return NextResponse.json({
      message: 'Joined game successfully',
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
} 