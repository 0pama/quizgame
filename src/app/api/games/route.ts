import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import { Game } from '@/lib/models/Game';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { questions, timePerQuestion } = await req.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const gameId = nanoid(6); // Generate a unique 6-character game ID

    const game = await Game.create({
      gameId,
      host: session.user.email,
      questions,
      timePerQuestion: timePerQuestion || 30,
      status: 'waiting',
      players: [],
      currentQuestion: 0,
      startTime: null,
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const games = await Game.find({
      $or: [
        { host: session.user.email },
        { 'players.userId': session.user.email }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
} 