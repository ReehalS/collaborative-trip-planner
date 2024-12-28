import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();
    //console.log(request);
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

    if (data.rawOffset !== undefined) {
      const utcOffset = data.rawOffset * 1000;
      const formattedOffset = utcOffset >= 0 ? `${utcOffset}` : `-${utcOffset}`;
      return NextResponse.json({ timezone: formattedOffset });
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
