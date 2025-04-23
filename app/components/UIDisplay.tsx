'use client';

import { TodoListType, convertToHTML } from "../utils/openaiUtils";
import React, { useEffect, useState } from "react";

interface TodoListDisplayProps {
  todoList: TodoListType | null;
}

export default function TodoListDisplay({ todoList }: TodoListDisplayProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (todoList) {
      const generatedHtml = convertToHTML(todoList);
      setHtml(generatedHtml);
    }
  }, [todoList]);

  if (!todoList) {
    return <div className="p-6 border rounded shadow-sm">No todo list available</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-6 border rounded shadow-sm">
        <h2 className="text-xl font-bold mb-4">Generated Todo List</h2>
        <div dangerouslySetInnerHTML={{ __html: html }} className="todo-list-container" />
      </div>
      
      <div className="p-6 border rounded shadow-sm">
        <h2 className="text-xl font-bold mb-4">JSON Structure</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify(todoList, null, 2)}
        </pre>
      </div>
    </div>
  );
} 