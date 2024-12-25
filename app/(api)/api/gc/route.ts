import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    console.log(data);
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const addressComponents = data.results[0].address_components;

      const countryComponent = addressComponents.find((comp) =>
        comp.types.includes('country')
      );
      const cityComponent = addressComponents.find((comp) =>
        comp.types.includes('locality')
      );

      return NextResponse.json({
        latitude: location.lat,
        longitude: location.lng,
        country: countryComponent?.long_name || '',
        city: cityComponent?.long_name || '',
        address: data.results[0].formatted_address,
        categories: data.results[0].types,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch geocode data' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('Error fetching geocode:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
