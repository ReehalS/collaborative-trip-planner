import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '../_lib/openrouter';

const AutofillSchema = z.object({
  notes: z.string(),
  categories: z.array(z.string()),
  suggestedStartTime: z
    .string()
    .describe('Suggested start time in HH:MM format (24h)'),
  suggestedEndTime: z
    .string()
    .describe('Suggested end time in HH:MM format (24h)'),
});

export async function POST(request: NextRequest) {
  try {
    const { placeName, address, tripCity, tripCountry } = await request.json();

    const location = tripCity
      ? `${tripCity}, ${tripCountry}`
      : tripCountry || 'the trip destination';

    const result = await generateObject({
      model: defaultModel,
      schema: AutofillSchema,
      prompt: `You are a travel planning assistant. A user is adding "${placeName}" (located at: ${
        address || 'unknown address'
      }) as an activity for their trip to ${location}.

Generate helpful details:
- notes: A 1-2 sentence description of the place and a practical tip (opening hours, best time to visit, what to expect, approximate cost)
- categories: Up to 3 relevant categories from: restaurant, museum, outdoor, shopping, nightlife, cultural, nature, landmark, entertainment, sports, relaxation, temple, beach, park
- suggestedStartTime: A reasonable start time in HH:MM format (24-hour)
- suggestedEndTime: A reasonable end time in HH:MM format (24-hour)`,
    });

    return NextResponse.json(result.object);
  } catch (err) {
    console.error('AI autofill error:', err);
    return NextResponse.json(
      { error: 'Failed to autofill activity details' },
      { status: 500 }
    );
  }
}
