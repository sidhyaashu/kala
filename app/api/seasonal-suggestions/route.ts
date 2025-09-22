// File: app/api/seasonal-suggestions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BigQuery } from '@google-cloud/bigquery';
import { VertexAI } from '@google-cloud/vertexai';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_PROJECT_ID!,
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
});

const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1",
  googleAuthOptions: { credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!) }
});
const model = process.env.MODEL || "gemini-2.0-flash-001"
const generativeModel = vertex_ai.getGenerativeModel({ model:model });

export async function POST() {
  try {
    console.log("--- DEBUGGING SEASONAL SUGGESTIONS API ---");
    console.log("GOOGLE_PROJECT_ID:", process.env.GOOGLE_PROJECT_ID);
    console.log("GOOGLE_CREDENTIALS loaded:", !!process.env.GOOGLE_CREDENTIALS);
    // 1. Fetch upcoming holidays from BigQuery Public Dataset
    const query = `
      SELECT holiday_name, primary_date
      FROM \`bigquery-public-data.ml_datasets.holidays_and_events_for_forecasting\`
      WHERE region = 'IN' AND primary_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 90 DAY)
      ORDER BY primary_date
      LIMIT 5;
    `;
    const [job] = await bigquery.createQueryJob({ query });
    const [rows] = await job.getQueryResults();

    if (rows.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const upcomingHolidays = rows.map(row => ({
      name: row.holiday_name,
      date: row.primary_date.value,
    }));

    // 2. Fetch the artisan's live products from our database
    const products = await prisma.product.findMany({
      where: { status: 'LIVE' },
      select: { name: true, category: true, description: true },
    });

    if (products.length === 0) {
      return NextResponse.json({ 
          suggestions: [{
              holiday: "No products found",
              date: new Date().toISOString().split('T')[0],
              suggestion: "You have no live products to promote. Publish some products to get seasonal suggestions!",
              product_name: null
          }] 
      });
    }

    // 3. Use Vertex AI to generate a suggestion for each holiday
    const prompt = `
      You are an expert marketing advisor for local Indian artisans.
      Your task is to generate promotional suggestions for upcoming holidays based on an artisan's product list.

      Upcoming Holidays:
      ${upcomingHolidays.map(h => `- ${h.name} on ${h.date}`).join('\n')}

      Artisan's Product List:
      ${products.map(p => `- "${p.name}" (Category: ${p.category || 'Uncategorized'})`).join('\n')}

      Generate a response in a VALID JSON object with a single key "suggestions".
      The value should be an array of objects, one for each holiday. Each object MUST have the following keys:
      - "holiday": The name of the holiday.
      - "date": The date of the holiday (YYYY-MM-DD).
      - "suggestion": A short, actionable marketing tip (1-2 sentences) linking a specific product to the holiday. The tip should be encouraging.
      - "product_name": The name of the ONE most relevant product to promote for this holiday from the artisan's list. If no product is relevant, this should be null.

      Example for a single suggestion object:
      {
        "holiday": "Diwali",
        "date": "2025-10-21",
        "suggestion": "Your 'Hand-painted Clay Diyas' are perfect for Diwali! Start a social media campaign highlighting them as ideal gifts for the festival of lights.",
        "product_name": "Hand-painted Clay Diyas"
      }

      Ensure the output is a clean JSON object and nothing else.
    `;
    
    const resp = await generativeModel.generateContent(prompt);
    const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error("No response from AI.");

    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const aiResponse = JSON.parse(jsonString);

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("Error generating seasonal suggestions:", error);
    // Provide a structured error response
    return NextResponse.json({ error: "Failed to get AI seasonal suggestions." }, { status: 500 });
  }
}