import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TodoList } from "../../utils/openaiUtils";

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
          content: "You are a todo list generator. Generate a todo list based on the user's input. Return the response in JSON format."
        },
        { 
          role: "user", 
          content: `Please create a todo list for: ${prompt}. Make sure to return a JSON with 'name' and 'todos' array containing items with 'title', 'description', 'priority', 'completed', and optional 'dueDate'.` 
        }
      ],
      max_tokens: 500,
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
      return NextResponse.json(
        { 
          error: "Schema validation failed", 
          details: validationError.errors,
          rawResponse: parsedContent
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error generating todo list:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to generate todo list" },
      { status: 500 }
    );
  }
} 