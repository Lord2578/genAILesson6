'use client';

import React, { useState } from "react";

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() !== "") {
      onSubmit(prompt);
    }
  };

  const examplePrompts = [
    "Create a work tasks todo list",
    "Make a shopping list for the weekend",
    "Build a vacation planning checklist",
    "Design a home renovation task list",
    "Create a study plan for finals"
  ];

  return (
    <div className="p-6 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">Todo List Generator</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="prompt" className="block mb-2 font-medium">
            Describe the todo list you want to generate:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="e.g., Create a work tasks todo list"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium">Examples:</span>
          {examplePrompts.map((examplePrompt) => (
            <button
              key={examplePrompt}
              type="button"
              onClick={() => setPrompt(examplePrompt)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isLoading}
            >
              {examplePrompt}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className={`px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading || prompt.trim() === ""}
        >
          {isLoading ? "Generating..." : "Generate Todo List"}
        </button>
      </form>
    </div>
  );
} 