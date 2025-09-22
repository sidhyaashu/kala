// File: app/api/chat-create-product/route.ts
import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import prisma from '@/lib/prisma';


// This will act as our "agent" to guide the conversation
const systemInstruction = `
You are a friendly and helpful AI assistant for artisans on an e-commerce platform. Your goal is to create a new product listing by asking the artisan a series of simple questions one by one.

- Start by asking for the product's story.
- After getting the story, ask for the minimum price.
- Once you have both the story and the price, you MUST respond with a valid JSON object containing the generated product details and a concluding message.
- The final JSON object MUST have the keys: "status", "productDetails", and "reply".
- "status" should be "COMPLETED".
- "productDetails" should contain "title", "description", "tags", and "suggestedPrice".
- "reply" should be a friendly confirmation message to the artisan.
- Do not ask for the product name; you will generate it from the story.
- Keep your questions short, simple, and encouraging.
`;

export async function POST(request: Request) {
  const { history, message } = await request.json();

  try {

    if (!process.env.GOOGLE_CREDENTIALS || !process.env.GOOGLE_PROJECT_ID || !process.env.MODEL) {
        throw new Error("Google Cloud environment variables are not configured.");
    }

    const vertex_ai = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: "us-central1",
      googleAuthOptions: {
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      }
    });

    const model = process.env.MODEL || "gemini-2.0-flash-001";
    const generativeModel = vertex_ai.getGenerativeModel({ model });



    const chat = generativeModel.startChat({
      history,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("AI did not return a valid response.");
    }

    // Check if the AI's response is the final JSON object
    if (responseText.includes('"status": "COMPLETED"')) {
      const jsonResponse = JSON.parse(responseText.match(/\{.*\}/s)![0]);
      
      // Save the final product to the database
      const { title, description, tags, suggestedPrice } = jsonResponse.productDetails;
      // The final user message contains all the bundled data
      const { story, minPrice, imageUrl } = JSON.parse(message); 

      await prisma.product.create({
        data: {
          name: title,
          description,
          price: Math.round(suggestedPrice),
          tags,
          artisanNotes: story,
          imageUrl,
          status: 'DRAFT',
        },
      });

      return NextResponse.json(jsonResponse);
    }

    // If it's not the final response, just return the AI's next question
    return NextResponse.json({ reply: responseText });

  } catch (error) {
    console.error("Error in chat conversation:", error);
    return NextResponse.json({ error: "AI chat failed." }, { status: 500 });
  }
}