# Quiz Game

A real-time multiplayer quiz game built with Next.js, MongoDB, and WebSocket.

## Features

- Create and join quiz games
- Real-time game updates
- QR code for easy game joining
- Leaderboard with smooth animations
- User authentication
- Responsive design

## Tech Stack

- Next.js 14 (App Router)
- MongoDB
- NextAuth.js
- Tailwind CSS
- Framer Motion
- TypeScript

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd quiz-game
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/quiz-game
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (game)/            # Game-related pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions and database models
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
