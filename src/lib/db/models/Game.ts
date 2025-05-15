import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
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
  points: {
    type: Number,
    default: 10,
  },
});

const playerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  answers: [{
    questionIndex: Number,
    answer: Number,
    isCorrect: Boolean,
    points: Number,
  }],
});

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['lobby', 'in-progress', 'completed'],
    default: 'lobby',
  },
  currentQuestion: {
    type: Number,
    default: 0,
  },
  questions: [questionSchema],
  players: [playerSchema],
  startTime: Date,
  endTime: Date,
  settings: {
    timePerQuestion: {
      type: Number,
      default: 30,
    },
    showLeaderboard: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Generate a unique game ID
gameSchema.pre('save', async function(next) {
  if (!this.gameId) {
    this.gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.models.Game || mongoose.model('Game', gameSchema); 