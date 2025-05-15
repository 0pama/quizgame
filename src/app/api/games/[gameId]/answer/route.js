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
    const { answer, questionIndex } = await req.json();

    await connectDB();

    const game = await Game.findOne({ gameId });
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'in-progress') {
      return NextResponse.json(
        { error: 'Game is not in progress' },
        { status: 400 }
      );
    }

    if (game.currentQuestion !== questionIndex) {
      return NextResponse.json(
        { error: 'Question has already passed' },
        { status: 400 }
      );
    }

    // Find the player
    const playerIndex = game.players.findIndex(
      p => p.userId === session.user.email
    );

    if (playerIndex === -1) {
      return NextResponse.json(
        { error: 'You are not in this game' },
        { status: 403 }
      );
    }

    // Check if player has already answered
    const hasAnswered = game.players[playerIndex].answers.some(
      a => a.questionIndex === questionIndex
    );

    if (hasAnswered) {
      return NextResponse.json(
        { error: 'You have already answered this question' },
        { status: 400 }
      );
    }

    // Add answer
    game.players[playerIndex].answers.push({
      questionIndex,
      answer,
      timeSpent: game.timePerQuestion - Math.floor((new Date() - new Date(game.startTime)) / 1000) % game.timePerQuestion,
    });

    // Check if answer is correct and update score
    const isCorrect = answer === game.questions[questionIndex].correctAnswer;
    if (isCorrect) {
      game.players[playerIndex].score += 1;
    }

    // Check if all players have answered
    const allPlayersAnswered = game.players.every(player =>
      player.answers.some(a => a.questionIndex === questionIndex)
    );

    // If all players have answered, move to next question or end game
    if (allPlayersAnswered) {
      if (game.currentQuestion + 1 < game.questions.length) {
        game.currentQuestion += 1;
      } else {
        game.status = 'completed';
      }
    }

    await game.save();

    return NextResponse.json({ message: 'Answer submitted successfully' });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
} 