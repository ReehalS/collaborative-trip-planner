import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '../_lib/openrouter';

const OptimizationSchema = z.object({
  optimizedOrder: z.array(
    z.object({
      activityId: z.string(),
      activityName: z.string(),
      suggestedDate: z.string(),
      suggestedTimeSlot: z.string(),
      reasoning: z.string(),
    })
  ),
  overallReasoning: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { activities, tripCity, tripCountry } = await request.json();

    const location = tripCity ? `${tripCity}, ${tripCountry}` : tripCountry;

    const activitiesDescription = activities
      .map(
        (a: Record<string, string | number | string[]>, i: number) =>
          `${i + 1}. "${a.activityName}" (id: ${a.id}) at (${a.latitude}, ${
            a.longitude
          }) - current time: ${a.startTime} to ${a.endTime}${
            a.categories?.length
              ? ` [${(a.categories as string[]).join(', ')}]`
              : ''
          }`
      )
      .join('\n');

    const result = await generateObject({
      model: defaultModel,
      schema: OptimizationSchema,
      prompt: `You are a travel itinerary optimizer for a trip to ${location}.

Here are the planned activities:
${activitiesDescription}

Analyze the activities and suggest an optimized order considering:
1. Geographic proximity (minimize travel between activities)
2. Logical time-of-day grouping (outdoor activities in morning, restaurants at mealtimes, nightlife in evening)
3. Realistic daily schedules (not too many activities per day, allow buffer time)

Return ALL activities in your suggested optimal order with brief reasoning for each placement.`,
    });

    return NextResponse.json(result.object);
  } catch (err) {
    console.error('AI optimize itinerary error:', err);
    return NextResponse.json(
      { error: 'Failed to optimize itinerary' },
      { status: 500 }
    );
  }
}
