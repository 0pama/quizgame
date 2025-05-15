'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function CreateGamePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    if (questions.length >= 20) {
      toast.error('Maximum 20 questions allowed');
      return;
    }
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) throw new Error('Failed to create game');

      const data = await response.json();
      toast.success('Game created successfully!');
      router.push(`/game/${data.gameId}/lobby`);
    } catch (error) {
      toast.error('Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Please login to create a game</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Create New Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Question {qIndex + 1}
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-4">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex}>
                    <label className="block text-sm font-medium text-gray-700">
                      Option {oIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(qIndex, 'options', newOptions);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Correct Answer
                </label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {q.options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Add Question
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 