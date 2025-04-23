'use client';

import { useState } from 'react';
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
      const mockData = getMockTodoList(prompt);
      setTimeout(() => {
        setTodoList(mockData);
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    try {
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.status === 402) {
        setError('API credit limit reached. Using mock data instead.');
        setUseMockData(true);
        const mockData = getMockTodoList(prompt);
        setTodoList(mockData);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.error === "Schema validation failed") {
          console.error("Schema validation error details:", errorData.details);
          console.log("Raw API response:", errorData.rawResponse);
          setError(`Помилка валідації схеми. Переходимо на тестові дані.`);
          
          setUseMockData(true);
          const mockData = getMockTodoList(prompt);
          setTodoList(mockData);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate todo list');
      }

      const data = await response.json();
      setTodoList(data.todoList);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("API error:", err);
      setError(`${err.message || 'An error occurred'}. Using mock data instead.`);
      
      const mockData = getMockTodoList(prompt);
      setTimeout(() => {
        setTodoList(mockData);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-8 pb-20 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col items-center">

        <h1 className="text-3xl font-bold text-center">Structured Output Demo - Todo Generator</h1>
        
      </header>

      <main className="grid gap-10 md:grid-cols-2">
        <div>
          <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              {error}
            </div>
          )}
          
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
