import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Create a simple Todo schema using Zod
export const Todo = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
});

export type TodoType = z.infer<typeof Todo>;

// Create a TodoList schema
export const TodoList = z.object({
  name: z.string(),
  todos: z.array(Todo).default([]),
});

export type TodoListType = z.infer<typeof TodoList>;

/**
 * Converts the Todo list to HTML
 */
export function convertToHTML(todoList: TodoListType): string {
  let html = `<div class="todo-list">
  <h2>${todoList.name}</h2>
  <ul class="todos">`;

  todoList.todos.forEach((todo) => {
    const priorityClass = `priority-${todo.priority}`;
    const completedClass = todo.completed ? "completed" : "";
    
    html += `
    <li class="todo-item ${priorityClass} ${completedClass}">
      <div class="todo-header">
        <h3>${todo.title}</h3>
        <span class="priority">${todo.priority}</span>
      </div>
      ${todo.description ? `<p>${todo.description}</p>` : ''}
      ${todo.dueDate ? `<div class="due-date">Due: ${todo.dueDate}</div>` : ''}
      <div class="status">${todo.completed ? 'Completed' : 'Pending'}</div>
    </li>`;
  });

  html += `
  </ul>
</div>`;

  return html;
}

// Function to generate Todo list from a prompt using OpenRouter API
export async function generateTodoList(prompt: string): Promise<TodoListType | null> {
  try {
    // Using OpenAI client but configuring it for OpenRouter
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || "",
      baseURL: "https://openrouter.ai/api/v1",
      defaultQuery: { "route": "openai" },
      defaultHeaders: {
        "HTTP-Referer": "https://structured-output-demo.vercel.app",
        "X-Title": "Structured Output Demo"
      }
    });
    
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a todo list generator. Generate a todo list based on the user's input. Return the response in JSON format."
        },
        { 
          role: "user", 
          content: `Please create a todo list for: ${prompt}. Make sure to return a JSON with name and todos array.` 
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    if (!completion.choices || completion.choices.length === 0) {
      console.error("No choices returned from API");
      return null;
    }
    
    const rawResponseContent = completion.choices[0]?.message?.content || "{}";
    const parsedContent = JSON.parse(rawResponseContent);
    
    // Validate with our schema
    return TodoList.parse(parsedContent);
  } catch (error) {
    console.error("Error generating todo list:", error);
    return null;
  }
} 