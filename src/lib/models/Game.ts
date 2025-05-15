import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  host: {
    type: String,
    required: true,
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    correctAnswer: {
      type: Number,
      required: true,
    },
  }],
  timePerQuestion: {
    type: Number,
    default: 30,
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting',
  },
  players: [{
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    answers: [{
      questionIndex: Number,
      answer: Number,
      timeSpent: Number,
    }],
  }],
  currentQuestion: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export const Game = mongoose.models.Game || mongoose.model('Game', gameSchema); 