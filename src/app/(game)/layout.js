'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GameLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex-shrink-0 flex items-center">
                          <Link href="/" className="text-xl font-bold text-indigo-600">
                            Quiz Game
                          </Link>
                        </div>
            <div className="flex items-center">
              <span className="text-xs sm:text-sm text-gray-500 mr-2 sm:mr-4">
                {session.user.username}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {children}
        </div>
      </main>
    </div>
  );
} 