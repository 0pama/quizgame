[200~You are building a multiplayer quiz game web app like Mentimeter, but simpler, using Next.js (App Router), MongoDB, and Tailwind CSS.

🧱 TECH STACK:
- Framework: Next.js with App Router (not Pages Router)
- DB: MongoDB (required to connect at MONGO_URI=mongodb://localhost:27017)
- Styling: Tailwind CSS
- Real-time: Socket.IO (or any real-time solution)
- Session: Cookie-based session (iron-session or NextAuth credentials)

🎯 CORE FUNCTIONALITY:

1. AUTH:
- Simple login popup for non-logged-in users
- Login required before creating or joining a game
- Store session with cookies

2. GAME CREATION:
- Users create a game by selecting question categories
- System fetches 20 questions from MongoDB based on selected categories
- Store questions, host, and game state in MongoDB
- Redirect to a lobby page with QR code and game ID

3. LOBBY:
- Display all participants in real-time
- Allow joining via QR code or searching game ID in /join
- Require login before joining

4. GAME FLOW:
- 20 rounds (1 question each round)
- After each answer:
    - Show correct/incorrect feedback
    - Show animated leaderboard (compare with previous scores)
- Go to next round automatically

5. QUESTIONS:
- Questions are stored in a MongoDB zsh: command not found: questions collection:
  {
    text: String,
    options: [String],
    correctAnswerIndex: Number,
    category: String
  }

6. GAMES:
- Each game stores selected categories, selected questions, player scores, and progress

7. ANIMATIONS:
- Use Framer Motion or Tailwind transitions to animate the leaderboard after every round

💾 DATABASE REQUIREMENT:
- Must connect to local MongoDB at: MONGO_URI=mongodb://localhost:27017

📂 FOLDER STRUCTURE:
- Use App Router: /app/login, /app/create, /app/lobby/[gameId], /app/game/[gameId], /app/join
- Use /components, /models, /lib for shared logic

Please scaffold the app and set up login, game creation, lobby join flow, and round-based gameplay with animations and real-time updates.
~
