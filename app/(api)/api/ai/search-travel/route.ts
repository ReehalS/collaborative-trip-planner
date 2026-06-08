import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { webSearchModel, defaultModel } from '../_lib/openrouter';

const categoryConfig: Record<
  string,
  { type: string; desc: string; priceExample: string }
> = {
  hotels: {
    type: 'hotel',
    desc: 'hotels, boutique hotels, hostels, apartments, and accommodations',
    priceExample: '"$89/night" or "$120–$250/night"',
  },
  activities: {
    type: 'activity',
    desc: 'tourist attractions, tours, cultural experiences, and things to do',
    priceExample: '"Free" or "$25/person" or "$15–$40/person"',
  },
  restaurants: {
    type: 'restaurant',
    desc: 'restaurants, cafes, street food, and local dining experiences',
    priceExample: '"$12–$25/person" or "$50+ per person"',
  },
};

function buildPrompt(
  location: string,
  category: string,
  query: string
): string {
  const cat = categoryConfig[category] || categoryConfig.activities;
  const queryText = query ? ` specifically: ${query}` : '';

  return `Find 6 of the best ${cat.desc} in ${location}${queryText}.
Include real names, accurate prices, and specific details.

Return ONLY this JSON structure, no other text:
{
  "results": [
    {
      "name": "Exact name of the place",
      "type": "${cat.type}",
      "description": "2-3 engaging sentences about what makes this special and what visitors experience",
      "priceRange": ${cat.priceExample},
      "rating": 4.5,
      "reviewCount": 1250,
      "location": "Specific neighborhood or street",
      "highlights": ["feature1", "feature2", "feature3", "feature4"]
    }
  ]
}`;
}

function extractJSON(text: string): object | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { city, country, category, query = '' } = await request.json();
    const location = city ? `${city}, ${country}` : country;
    const prompt = buildPrompt(location, category, query);

    // Try web search model first for real-time prices
    try {
      const result = await generateText({
        model: webSearchModel,
        prompt,
      });
      const parsed = extractJSON(result.text);
      if (parsed) return NextResponse.json(parsed);
    } catch {
      // fall through to default model
    }

    // Fallback: default model (no live search, but strong knowledge of major cities)
    const fallback = await generateText({
      model: defaultModel,
      prompt,
    });
    const parsed = extractJSON(fallback.text);
    if (parsed) return NextResponse.json(parsed);

    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  } catch (err) {
    console.error('Travel search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
