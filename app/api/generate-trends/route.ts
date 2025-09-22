// File: app/api/generate-trends/route.ts
import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) }
});

const model = process.env.MODEL || "gemini-2.0-flash-001";
const generativeModel = vertex_ai.getGenerativeModel({ model });

// In a real-world scenario, you might fetch this data from a database
// or a real-time analytics service. For this example, we use a static list.
const productCategories = ["Pottery", "Textiles", "Woodwork", "Jewelry"];

export async function POST(request: Request) {
  const { category } = await request.json();

  if (!productCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid product category." }, { status: 400 });
  }

  const prompt = `
    You are an expert e-commerce trend analyst for a platform supporting local Indian artisans.
    Your task is to provide the latest market trends for the "${category}" category.

    Analyze current consumer preferences, color palettes, and popular styles.

    Generate a response in a VALID JSON object with the following structure:
    {
      "category": "${category}",
      "trendingColors": [
        { "name": "Color Name 1", "hex": "#RRGGBB", "reason": "A short, compelling reason why this color is trending." },
        { "name": "Color Name 2", "hex": "#RRGGBB", "reason": "Another short reason." }
      ],
      "trendingStyles": [
        { "name": "Style Name 1", "description": "A brief description of the trending style and why it's popular." },
        { "name": "Style Name 2", "description": "Another brief style description." }
      ],
      "actionableTip": "Provide one single, encouraging, and actionable tip for an artisan in this category to leverage these trends."
    }

    Keep the reasons and descriptions concise and easy for an artisan to understand.
    Focus on trends relevant to the Indian and global markets for handcrafted goods.
  `;

  try {
    const resp = await generativeModel.generateContent(prompt);
    const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("AI did not return a valid response.");
    }
    
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const trendData = JSON.parse(jsonString);

    return NextResponse.json(trendData);
  } catch (error) {
    console.error("Error generating trend data:", error);
    return NextResponse.json({ error: "Failed to generate trend insights." }, { status: 500 });
  }
}