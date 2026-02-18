import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();
    if (latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'Latitude and Longitude are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(
        Date.now() / 1000
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.timeZoneId) {
      // Return the IANA timezone name (e.g. "America/Los_Angeles")
      // which correctly handles DST automatically.
      return NextResponse.json({ timezone: data.timeZoneId });
    } else if (data.rawOffset !== undefined) {
      // Fallback: combine rawOffset + dstOffset for total UTC offset in ms
      const totalOffsetMs = (data.rawOffset + (data.dstOffset || 0)) * 1000;
      return NextResponse.json({ timezone: `${totalOffsetMs}` });
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch timezone data' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('Error fetching timezone:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
