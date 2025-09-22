// File: app/api/generate-suggestions/route.ts
import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import prisma from '@/lib/prisma';

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) }
});

const model = process.env.MODEL || "gemini-2.0-flash-001";
const generativeModel = vertex_ai.getGenerativeModel({ model });

export async function POST(request: Request) {
  const { products } = await request.json();

  if (!products || products.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  const prompt = `
    You are a helpful e-commerce assistant for a local artisan. Based on their current list of products, provide 2-3 short, actionable, and encouraging suggestions to help them improve their sales or marketing. Frame each suggestion as if you are speaking directly to the artisan.

    Product List:
    ${products.map((p: any) => `- ${p.name} (Status: ${p.status})`).join('\n')}

    Generate a response in a VALID JSON format with a single key "suggestions". 
    The value should be an array of objects, where each object has two keys: "suggestion" (a string) and "icon" (a relevant icon name from lucide-react, e.g., "Tag", "Megaphone", "Package").

    Example output:
    {
      "suggestions": [
        { "suggestion": "Your 'Pashmina Shawl' is still a draft. Consider publishing it before the weekend to catch shoppers!", "icon": "Package" },
        { "suggestion": "Try creating a social media post for your 'Wooden Elephant' to highlight its unique carving details.", "icon": "Megaphone" }
      ]
    }
  `;

  try {
    const resp = await generativeModel.generateContent(prompt);
    const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error("No response from AI.");
    
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(jsonString));
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ error: "Failed to get AI suggestions." }, { status: 500 });
  }
}