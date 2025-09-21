// File: pp/api/generate-promo-image/route.ts
import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) }
});

// IMPORTANT: Note that we are using the 'preview' namespace for Imagen models
const model = process.env.MODEL_IMAGEN as string;
const generativeModel = vertex_ai.preview.getGenerativeModel({ model });

export async function POST(request: Request) {
  const { name, description } = await request.json();

  if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
  }

  const prompt = `
    A vibrant and elegant promotional graphic for an artisan's product.
    Product Name: "${name}".
    Description: "${description}".
    The style should be a beautiful, eye-catching studio shot with a soft, warm, and slightly blurred background, highlighting the product's handcrafted quality. The lighting should be professional and warm. The final image should look minimalist, clean, and premium.
  `;

  try {
    const result = await generativeModel.generateContent(prompt);

    // Add a guard clause to safely handle cases where the response is blocked by safety filters
    if (!result.response.candidates || result.response.candidates.length === 0) {
      console.error("Imagen response blocked or empty. Response:", JSON.stringify(result.response));
      throw new Error("The AI model did not return a valid response, it may have been blocked.");
    }

    const response = result.response.candidates[0];

    // The image data is in a specific field; we use @ts-ignore as types might not be fully updated
    // @ts-ignore
    const imageBase64 = response.customPrediction?.bytesBase64Encoded;

    if (!imageBase64) {
      throw new Error("Imagen did not return a valid image in the response payload.");
    }

    return NextResponse.json({ imageBase64 });
  } catch (error) {
    console.error("Error generating promo image with Imagen:", error);
    // Return a more specific error message to the client
    const errorMessage = error instanceof Error ? error.message : "Failed to generate AI image.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}