import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '../_lib/openrouter';

const SuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      activityName: z.string(),
      notes: z.string(),
      estimatedDuration: z.string(),
      categories: z.array(z.string()),
      suggestedTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'any']),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const { city, country, existingActivities, numberOfDays, userPreferences } =
      await request.json();

    const location = city ? `${city}, ${country}` : country;
    const count = numberOfDays ? numberOfDays * 3 : 5;

    const existingList = existingActivities?.length
      ? `\nThe group already has these activities planned: ${existingActivities
          .map((a: { activityName: string }) => a.activityName)
          .join(
            ', ',
          )}. Suggest different activities that complement the existing ones. That are NEARBY and do not overlap. Suggest activities that fit well within the time constraints of the trip.`
      : '';

    const preferencesText = userPreferences
      ? `\n\nUser preferences: ${userPreferences}`
      : '';

    const result = await generateObject({
      model: defaultModel,
      schema: SuggestionSchema,
      prompt: `You are a travel planning assistant. Suggest ${count} activities for a trip to ${location}.${existingList}${preferencesText}

Focus on a mix of: popular tourist attractions, local hidden gems, food/restaurant experiences, cultural experiences, and outdoor activities.
For each activity, provide:
- activityName: The name of the place or activity
- notes: A 1-2 sentence description with a practical tip (best time to visit, what to expect, cost estimate)
- estimatedDuration: How long to spend (e.g. "2 hours", "half day")
- categories: Up to 3 relevant categories (e.g. "restaurant", "museum", "outdoor", "shopping", "nightlife", "cultural", "nature", "landmark")
- suggestedTimeOfDay: When is best to do this activity`,
    });

    return NextResponse.json(result.object);
  } catch (err) {
    console.error('AI suggest activities error:', err);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 },
    );
  }
}
