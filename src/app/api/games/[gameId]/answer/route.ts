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

    const { questionIndex, answer } = await req.json();

    await connectDB();

    const game = await Game.findOne({ gameId: params.gameId });

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

    if (questionIndex !== game.currentQuestion) {
      return NextResponse.json(
        { error: 'Invalid question index' },
        { status: 400 }
      );
    }

    // Find the player
    const playerIndex = game.players.findIndex(
      (player) => player.user.toString() === session.user.id
    );

    if (playerIndex === -1) {
      return NextResponse.json(
        { error: 'Player not found in game' },
        { status: 404 }
      );
    }

    const player = game.players[playerIndex];
    const question = game.questions[questionIndex];

    // Check if player has already answered this question
    const hasAnswered = player.answers.some(
      (a) => a.questionIndex === questionIndex
    );

    if (hasAnswered) {
      return NextResponse.json(
        { error: 'Already answered this question' },
        { status: 400 }
      );
    }

    // Record the answer
    const isCorrect = answer === question.correctAnswer;
    const points = isCorrect ? question.points : 0;

    player.answers.push({
      questionIndex,
      answer,
      isCorrect,
      points,
    });

    player.score += points;

    // Check if all players have answered
    const allPlayersAnswered = game.players.every((p) =>
      p.answers.some((a) => a.questionIndex === questionIndex)
    );

    if (allPlayersAnswered) {
      // Move to next question or end game
      if (game.currentQuestion + 1 < game.questions.length) {
        game.currentQuestion += 1;
      } else {
        game.status = 'completed';
        game.endTime = new Date();
      }
    }

    await game.save();

    return NextResponse.json({
      message: 'Answer submitted successfully',
      isCorrect,
      points,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
} 