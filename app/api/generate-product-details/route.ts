// File: app/api/generate-product-details/route.ts
import { NextResponse } from "next/server";
import { VertexAI, Part } from "@google-cloud/vertexai";
import https from 'https';

// Helper function to fetch image and convert to base64 (No changes here)
async function urlToGenerativePart(url: string, mimeType: string): Promise<Part> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch image. Status code: ${response.statusCode}`));
                return;
            }
            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType,
                    },
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: {
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
  }
});

const model = process.env.MODEL_VISION || "gemini-2.0-flash-001"; 
const generativeModel = vertex_ai.getGenerativeModel({ model });

export async function POST(request: Request) {
  const { story, minPrice, imageUrl } = await request.json();

  if (!story || !minPrice || !imageUrl) {
    return NextResponse.json({ error: "Story, minimum price, and image URL are required." }, { status: 400 });
  }

  const imagePart = await urlToGenerativePart(imageUrl, "image/png");

  // --- UPDATED PROMPT ---
  // We're now asking for 'colorPalette' and 'marketTrends' in the JSON response.
  const prompt = `
    You are an expert e-commerce marketer and trend analyst for a platform supporting local artisans.
    Based on the provided image and artisan's notes, generate a VALID JSON object.

    The JSON object must have the following keys: "title", "description", "tags", "suggestedPrice", "photoTip", "colorPalette", and "marketTrends".

    1.  **title**: A creative and marketable name for the product.
    2.  **description**: An SEO-friendly description. Mention colors, patterns, or textures visible in the image.
    3.  **tags**: An array of relevant keywords.
    4.  **suggestedPrice**: A price suggestion, reasonably higher than the artisan's minimum price.
    5.  **photoTip**: A single, short, encouraging, and actionable tip to improve the product photo. If the photo is excellent, give a compliment.
    6.  **colorPalette**: An array of 3-5 dominant hex color codes (e.g., ["#A52A2A", "#F5DEB3"]) identified from the product in the image.
    7.  **marketTrends**: A short sentence (1-2 sentences max) explaining why these colors or this style might be popular right now (e.g., "Earthy tones are very popular in home decor this season, bringing a sense of warmth and nature indoors!").

    Artisan's Notes: "${story}"
    Minimum Price: ₹${minPrice}
  `;

  try {
    const requestPayload = {
        contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
    };

    const resp = await generativeModel.generateContent(requestPayload);
    const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("AI did not return a valid response.");
    }
    
    // Clean potential markdown formatting from the response
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(jsonString);

    return NextResponse.json(aiData);
  } catch (error) {
    console.error("Error calling Vertex AI with Vision:", error);
    return NextResponse.json({ error: "Failed to generate AI content." }, { status: 500 });
  }
}