// File: pp/api/generate-promo-image/route.ts
import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) }
});

// IMPORTANT: Note that we are using the 'preview' namespace for Imagen models
const model = process.env.MODEL_IMAGEN || "imagen-4.0-generate-001";
const generativeModel = vertex_ai.preview.getGenerativeModel({ model });

async function safeGenerate(prompt: string, maxRetries = 3) {
  let delay = 3000; // start with 3s
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generativeModel.generateContent(prompt);
      return result;
    } catch (err: any) {
      if (err.code === 429) {
        console.warn(`Quota exceeded (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        if (attempt === maxRetries) throw err;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

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
    const result = await safeGenerate(prompt);

    if (!result?.response?.candidates || result.response.candidates.length === 0) {
      console.error("Imagen response blocked or empty:", JSON.stringify(result?.response));
      throw new Error("The AI model did not return a valid response, it may have been blocked by safety filters.");
    }

    const response = result.response.candidates[0];

    // @ts-ignore - field may differ depending on SDK version
    const imageBase64 = response.customPrediction?.bytesBase64Encoded;

    if (!imageBase64) {
      throw new Error("Imagen did not return a valid image payload.");
    }

    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error("Error generating promo image with Imagen:", error);

    let status = 500;
    let message = "Failed to generate AI image.";

    if (error.code === 429) {
      status = 429;
      message = "Quota exceeded for Imagen API. Try again later or request a quota increase.";
    }

    return NextResponse.json({ error: message }, { status });
  }
}
