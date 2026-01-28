import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { defaultModel } from '../_lib/openrouter';

export async function POST(request: NextRequest) {
  const { messages, tripContext } = await request.json();

  const location = tripContext?.city
    ? `${tripContext.city}, ${tripContext.country}`
    : tripContext?.country || 'an unknown destination';

  const activitiesList = tripContext?.activities?.length
    ? `\nThe group has these activities planned: ${tripContext.activities
        .map((a: { activityName: string }) => a.activityName)
        .join(', ')}.`
    : '';

  const systemMessage = `You are a friendly and knowledgeable travel assistant for a trip to ${location}.${activitiesList}

Help the user with:
- Local customs and etiquette
- Weather and best times to visit
- Transportation tips
- Food and restaurant recommendations
- Safety information
- Budget tips
- Any other travel-related questions

Be concise but helpful. Use bullet points when listing multiple items. Keep answers focused and practical.`;

  const result = streamText({
    model: defaultModel,
    system: systemMessage,
    messages,
  });

  return result.toDataStreamResponse();
}
