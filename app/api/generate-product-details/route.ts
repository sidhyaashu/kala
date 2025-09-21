// File: app/api/generate-product-details/route.ts
import { NextResponse } from "next/server";
import { VertexAI, Part } from "@google-cloud/vertexai";
import https from 'https';

// Helper function to fetch image and convert to base64
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

const model = process.env.MODEL_VISION as string; 
const generativeModel = vertex_ai.getGenerativeModel({ model });

export async function POST(request: Request) {
  const { story, minPrice, imageUrl } = await request.json();

  if (!story || !minPrice || !imageUrl) {
    return NextResponse.json({ error: "Story, minimum price, and image URL are required." }, { status: 400 });
  }

  const imagePart = await urlToGenerativePart(imageUrl, "image/png");

  const prompt = `
    You are an expert e-commerce marketer. Based on the provided image and artisan's notes, generate a VALID JSON object with "title", "description", "tags", and "suggestedPrice".
    
    Analysis of the image should influence the description and tags. For example, mention colors, patterns, or textures visible in the image.
    
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
    
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(jsonString);

    return NextResponse.json(aiData);
  } catch (error) {
    console.error("Error calling Vertex AI with Vision:", error);
    return NextResponse.json({ error: "Failed to generate AI content." }, { status: 500 });
  }
}