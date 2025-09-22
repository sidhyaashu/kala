// File: app/api/generate-marketing-post/route.ts
import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: {
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
  }
});

const model = process.env.MODEL || "gemini-2.0-flash-001";

const generativeModel = vertex_ai.getGenerativeModel({ model });

export async function POST(request: Request) {
  const { name, description } = await request.json();

  if (!name || !description) {
    return NextResponse.json({ error: "Product name and description are required." }, { status: 400 });
  }

  const prompt = `
    You are a creative social media marketing assistant for a platform that promotes local artisans.
    Your task is to generate an engaging Instagram post for the following product.

    Product Name: "${name}"
    Product Description: "${description}"

    Generate a response in a VALID JSON format with a single key "postContent".
    The value should be a string containing:
    1. A captivating hook to grab attention.
    2. A short paragraph that tells a story about the product.
    3. A clear call to action (e.g., "Shop now!", "Link in bio!").
    4. A set of 5-7 relevant and popular hashtags (e.g., #handmade, #artisan, #indiancraft, #supportlocal).

    Example output:
    {
      "postContent": "From the heart of the village to your home! ✨\\n\\nDiscover the timeless beauty of the '${name}'. Each piece is crafted with generations of skill, telling a unique story through its intricate details. Bring home a piece of tradition and support our incredible artisans.\\n\\nReady to own a masterpiece? Tap the link in our bio to shop!\\n\\n#handmade #indianart #artisanmade #supportlocalartists #craftsmanship #homedecor #unique"
    }
  `;

  try {
    const resp = await generativeModel.generateContent(prompt);
    const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("AI did not return a valid response.");
    }
    
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(jsonString);

    return NextResponse.json(aiData);
  } catch (error) {
    console.error("Error calling Vertex AI for marketing post:", error);
    return NextResponse.json({ error: "Failed to generate marketing content." }, { status: 500 });
  }
}