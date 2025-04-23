/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TodoList, TodoType } from "../../utils/openaiUtils";

function createBasicTodoList(prompt: string): { name: string, todos: TodoType[] } {
  const lowercasePrompt = prompt.toLowerCase();
  let name = `Todo List for ${prompt}`;
  const todos: TodoType[] = [];
  
  if (lowercasePrompt.includes("work") || lowercasePrompt.includes("project")) {
    name = "Work Tasks";
    todos.push(
      { title: "Complete project documentation", description: "Update all project files", priority: "high", completed: false },
      { title: "Schedule team meeting", description: "Discuss project timeline", priority: "medium", completed: false },
      { title: "Review recent changes", description: "Check latest updates", priority: "medium", completed: false }
    );
  } else if (lowercasePrompt.includes("home") || lowercasePrompt.includes("house")) {
    name = "Home Tasks";
    todos.push(
      { title: "Clean kitchen", description: "Wipe counters and sweep floor", priority: "medium", completed: false },
      { title: "Do laundry", description: "Wash and fold clothes", priority: "high", completed: false },
      { title: "Grocery shopping", description: "Buy essentials for the week", priority: "medium", completed: false }
    );
  } else if (lowercasePrompt.includes("shop") || lowercasePrompt.includes("buy")) {
    name = "Shopping List";
    todos.push(
      { title: "Buy groceries", description: "Fruits, vegetables, and milk", priority: "high", completed: false },
      { title: "Get household supplies", description: "Cleaning products and toiletries", priority: "medium", completed: false },
      { title: "Check for sales", description: "Look for discounts on needed items", priority: "low", completed: false }
    );
  } else {
    todos.push(
      { title: "Task 1", description: "Complete important task", priority: "high", completed: false },
      { title: "Task 2", description: "Plan next steps", priority: "medium", completed: false },
      { title: "Task 3", description: "Follow up on progress", priority: "low", completed: false }
    );
  }
  
  return { name, todos };
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultQuery: { "route": "openai" },
  defaultHeaders: {
    "HTTP-Referer": "https://structured-output-demo.vercel.app",
    "X-Title": "Structured Output Demo"
  }
});

export async function POST(request: NextRequest) {
  try {
    const { prompt = false } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = "openai/gpt-3.5-turbo";

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a todo list generator. Generate a todo list based on the user's input. Return the response in JSON format with the exact structure: { \"name\": \"List name\", \"todos\": [{ \"title\": \"Task name\", \"description\": \"Task description\", \"priority\": \"high\" OR \"medium\" OR \"low\" (choose one), \"completed\": boolean, \"dueDate\": \"YYYY-MM-DD\" (optional) }] }. Always use valid JSON format with these exact field names."
        },
        { 
          role: "user", 
          content: `Create a todo list for: ${prompt}. Return the data as JSON with this exact format: { "name": "List name", "todos": [{ "title": "Task name", "description": "Task description", "priority": "high" or "medium" or "low" (choose one), "completed": false }] }. Do not use "high|medium|low" as a value, choose exactly one of: "high", "medium", or "low".`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    console.log("Raw API response:", JSON.stringify(completion));
    
    if (!completion.choices || completion.choices.length === 0) {
      console.error("No choices returned from API");
      return NextResponse.json(
        { error: "API credit limit reached. Please use mock data." },
        { status: 402 }
      );
    }
    
    const rawResponseContent = completion.choices[0]?.message?.content || "{}";
    let parsedContent;
    
    try {
      parsedContent = JSON.parse(rawResponseContent);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return NextResponse.json(
        { error: "Invalid JSON response from API" },
        { status: 500 }
      );
    }
    
    try {
      const validatedTodoList = TodoList.parse(parsedContent);
      return NextResponse.json({ todoList: validatedTodoList });
    } catch (validationError: any) {
      console.error("Schema validation error:", validationError);
      
      try {
        if (parsedContent.todos && Array.isArray(parsedContent.todos)) {
          parsedContent.todos = parsedContent.todos.map((todo: { priority: string; completed: string | boolean; }) => {
            if (todo.priority === "high|medium|low") {
              todo.priority = "medium"; 
            }
            
            if (typeof todo.completed === 'string') {
              todo.completed = todo.completed.toLowerCase() === 'true';
            }
            
            return todo;
          });
        }
        
        const fixedTodoList = TodoList.parse(parsedContent);
        return NextResponse.json({ todoList: fixedTodoList });
      } catch (fixError) {
        console.error("Failed to fix validation errors:", fixError);
        
        const simpleTodoList = createBasicTodoList(prompt);
        console.log("Created simple todo list as fallback:", simpleTodoList);
        
        return NextResponse.json({ 
          todoList: simpleTodoList,
          warning: "Generated a simple todo list due to validation errors with API response"
        });
      }
    }
  } catch (error: any) {
    console.error("Error generating todo list:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to generate todo list" },
      { status: 500 }
    );
  }
} 