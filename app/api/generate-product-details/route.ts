import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
});
const model = process.env.MODEL_IMG as string; // Or any other suitable model
const generativeModel = vertex_ai.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 1,
  },
});
export async function POST(request: Request) {
  const { story, minPrice } = await request.json();
  if (!story || !minPrice) {
    return NextResponse.json(
      { error: "Story and minimum price are required." },
      { status: 400 }
    );
  }
  const prompt = `
You are an expert e-commerce marketer specializing in handmade crafts. An artisan has provided the following notes about their product:
code
Code
Artisan's Notes: "${story}"
Artisan's Minimum Price: ₹${minPrice}

Based on these notes, generate the following in a VALID JSON format:
1.  "title": A catchy, SEO-friendly product title (under 80 characters).
2.  "description": An engaging, story-driven product description (around 3-4 sentences) that highlights the craft's uniqueness and cultural value.
3.  "tags": An array of 5-7 relevant keywords (as strings) for marketing.
4.  "suggestedPrice": A competitive market price (as a number, without currency symbols) that is higher than the artisan's minimum price. Consider the perceived value of handcrafted goods.

Example Output Format:
{
  "title": "Example Title",
  "description": "Example description text.",
  "tags": ["tag1", "tag2"],
  "suggestedPrice": 2500
}

JSON Response:`;

  try {
    const resp = await generativeModel.generateContent(prompt);
    const responseText =
      resp.response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error("AI did not return a valid response.");
    }

    // Clean the response to ensure it's valid JSON
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(jsonString);

    return NextResponse.json(aiData);
  } catch (error) {
    console.error("Error calling Vertex AI:", error);
    return NextResponse.json(
      { error: "Failed to generate AI content." },
      { status: 500 }
    );
  }
}
