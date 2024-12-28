type TimezoneResponse = {
  timezone: string | null;
  error?: string; // Add this if your API returns an error field
};

const fetchTimezone = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const response = await fetch('/api/tz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude }),
    });
    console.log(response);

    if (!response.ok) {
      console.error(`Error`);
      return null;
    }

    const data: TimezoneResponse = await response.json();

    if (data.timezone) {
      return data.timezone;
    } else {
      console.error('Invalid timezone data:', data);
      return null;
    }
  } catch (err) {
    console.error('Failed to fetch timezone:', err);
    return null;
  }
};

export default fetchTimezone;
