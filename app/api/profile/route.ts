// File: app/api/profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { VertexAI } from '@google-cloud/vertexai';

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) }
});

const model = process.env.MODEL as string;
const generativeModel = vertex_ai.getGenerativeModel({ model });

// GET function to fetch the current profile
export async function GET() {
    const profile = await prisma.artisanProfile.findUnique({
        where: { id: "main_artisan" },
    });
    if (!profile) {
        // Return a default empty state if no profile exists yet
        return NextResponse.json({ name: '', storyNotes: '', profileImage: '' });
    }
    return NextResponse.json(profile);
}

// POST function to update profile and generate the AI biography
export async function POST(request: Request) {
    const { name, storyNotes, profileImage } = await request.json();

    if (!name || !storyNotes) {
        return NextResponse.json({ error: "Name and story notes are required." }, { status: 400 });
    }

    try {
        const prompt = `
            You are a professional biographer for an artisan marketplace. Based on the artisan's raw notes, write a compelling, warm, and engaging third-person biography (2-3 paragraphs). The bio should be suitable for a public "About the Artisan" page.
            
            Artisan's Name: "${name}"
            Artisan's Notes: "${storyNotes}"

            Generate a response in a VALID JSON format with a single key "bio".
        `;

        const resp = await generativeModel.generateContent(prompt);
        const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("AI failed to generate a biography.");

        const { bio } = JSON.parse(responseText.replace(/```json|```/g, '').trim());

        // Use upsert: update if exists, create if not.
        const updatedProfile = await prisma.artisanProfile.upsert({
            where: { id: "main_artisan" },
            update: { name, storyNotes, bio, profileImage },
            create: { id: "main_artisan", name, storyNotes, bio, profileImage },
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }
}