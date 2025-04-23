import { TodoListType } from "./openaiUtils";

export const sampleWorkTodoList: TodoListType = {
  name: "Work Tasks",
  todos: [
    {
      title: "Complete project proposal",
      description: "Finish the budget section and executive summary",
      priority: "high",
      completed: false,
      dueDate: "2023-12-15"
    },
    {
      title: "Review pull requests",
      description: "Check the new feature implementations from the team",
      priority: "medium",
      completed: false
    },
    {
      title: "Update documentation",
      description: "Add examples to the API documentation",
      priority: "low",
      completed: true
    },
    {
      title: "Weekly team meeting",
      description: "Prepare status update for the sprint review",
      priority: "medium",
      completed: false,
      dueDate: "2023-12-12"
    },
    {
      title: "Fix critical bug in production",
      description: "The login page is not working for some users",
      priority: "high",
      completed: false
    }
  ]
};

export const samplePersonalTodoList: TodoListType = {
  name: "Personal Tasks",
  todos: [
    {
      title: "Grocery shopping",
      description: "Buy ingredients for the week",
      priority: "medium",
      completed: false
    },
    {
      title: "Pay bills",
      description: "Electricity and internet bills are due",
      priority: "high",
      completed: false,
      dueDate: "2023-12-10"
    },
    {
      title: "Schedule dentist appointment",
      description: "Call Dr. Smith for a checkup",
      priority: "low",
      completed: false
    },
    {
      title: "Clean garage",
      description: "Organize tools and donate unused items",
      priority: "low",
      completed: false
    },
    {
      title: "Morning run",
      description: "5km run in the park",
      priority: "medium",
      completed: true
    }
  ]
};

// Helper function to get mock data based on prompt
export function getMockTodoList(prompt: string): TodoListType {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes("work") || lowercasePrompt.includes("office") || lowercasePrompt.includes("project")) {
    return sampleWorkTodoList;
  } else if (lowercasePrompt.includes("personal") || lowercasePrompt.includes("home") || lowercasePrompt.includes("shop")) {
    return samplePersonalTodoList;
  }
  
  // Default to work todo list if no match
  return sampleWorkTodoList;
} 