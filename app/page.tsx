'use client';

import { useState } from 'react';
import Image from "next/image";
import PromptForm from './components/PromptForm';
import TodoListDisplay from './components/UIDisplay';
import { TodoListType } from './utils/openaiUtils';
import { getMockTodoList } from './utils/mockData';

export default function Home() {
  const [todoList, setTodoList] = useState<TodoListType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    if (useMockData) {
      // Use mock data
      const mockData = getMockTodoList(prompt);
      setTimeout(() => {
        setTodoList(mockData);
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    try {
      // Using the actual API with OpenRouter
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      // Check for credit limit error (402)
      if (response.status === 402) {
        setError('API credit limit reached. Using mock data instead.');
        setUseMockData(true);
        const mockData = getMockTodoList(prompt);
        setTodoList(mockData);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate todo list');
      }

      const data = await response.json();
      setTodoList(data.todoList);
    } catch (err: any) {
      console.error("API error:", err);
      setError(`${err.message || 'An error occurred'}. Using mock data instead.`);
      
      // Fall back to mock data
      const mockData = getMockTodoList(prompt);
      setTimeout(() => {
        setTodoList(mockData);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMockData = () => {
    setUseMockData(prev => !prev);
  };

  return (
    <div className="min-h-screen p-8 pb-20 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col items-center">
        <Image
          className="dark:invert mb-6"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl font-bold text-center">Structured Output Demo - Todo Generator</h1>
        <p className="text-center mt-2 text-gray-600 max-w-2xl">
          Describe a todo list and we'll generate it using {useMockData ? 'mock data' : 'OpenRouter API with GPT-3.5 Turbo'} and Zod schema validation.
        </p>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={toggleMockData} 
            className="px-4 py-2 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200"
          >
            {useMockData ? 'Switch to API' : 'Switch to Mock Data'}
          </button>
        </div>
      </header>

      <main className="grid gap-10 md:grid-cols-2">
        <div>
          <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-8 p-6 border rounded shadow-sm">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Enter a description of the todo list you want to generate</li>
              <li>The prompt is sent to the {useMockData ? 'mock data generator' : 'OpenRouter API with GPT-3.5 Turbo'}</li>
              <li>The response is validated against our Zod schema</li>
              <li>The todo list is rendered in the browser</li>
              <li>You can see both the visual output and the structured JSON</li>
            </ol>
          </div>
        </div>
        
        <div>
          {isLoading ? (
            <div className="p-6 border rounded shadow-sm flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4">Generating Todo List...</p>
              </div>
            </div>
          ) : (
            <TodoListDisplay todoList={todoList} />
          )}
        </div>
      </main>
    </div>
  );
}
