'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
          >
            Quiz Game
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl mx-auto text-xl text-gray-500"
          >
            Create or join a quiz game and test your knowledge!
          </motion.p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <button
                    onClick={() => router.push('/create')}
                    className="focus:outline-none"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    Create Game
                  </button>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new quiz game with your own questions and invite others to play.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <button
                    onClick={() => router.push('/join')}
                    className="focus:outline-none"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    Join Game
                  </button>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Join an existing game using a game ID or scan a QR code.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {!session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500">
              Please{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                sign in
              </button>{' '}
              to create or join a game.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
