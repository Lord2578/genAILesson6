# Structured Output Demo - UI Generator

This demo showcases how to use OpenRouter API with GPT-4o for structured output feature with Zod schema validation to generate UI components based on natural language prompts.

## Features

- Generate UI components from text descriptions
- Validate JSON responses using Zod schemas
- Convert JSON structure to HTML
- Display both the UI and the underlying JSON structure

## How It Works

1. The user enters a description of the UI they want to generate
2. The prompt is sent to the OpenRouter API with a structured Zod schema
3. The API returns a structured JSON object validated against our schema
4. We convert the JSON structure to HTML
5. The HTML is rendered in the browser

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

### Using the OpenRouter API

To use the OpenRouter API (already configured):

1. Copy `.env.local.example` to `.env.local`
2. Add your OpenRouter API key to `.env.local`

### Using Mock Data (Fallback)

If you don't have an OpenRouter API key, you can use the mock data by uncommenting the mock data code in `app/page.tsx` and commenting out the API call code:

```typescript
// In app/page.tsx, use this code instead:
// Using mock data
const mockData = getMockUIData(prompt);
setTimeout(() => {
  setUiData(mockData);
  setIsLoading(false);
}, 1000);

/* Comment out the API code
const response = await fetch('/api/generate-ui', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt }),
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Failed to generate UI');
}

const data = await response.json();
setUiData(data.ui);
*/
```

## Running the Demo

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Example Prompts

- "Create a login form"
- "Make a product info form"
- "Build a contact us section"
- "Design a newsletter signup form"
- "Create a user profile page"

## Technologies Used

- Next.js
- React
- TypeScript
- OpenRouter API with GPT-4o
- Zod for schema validation
- Tailwind CSS
