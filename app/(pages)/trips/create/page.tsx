'use client';

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../_types'

const VALIDATE_JOIN_CODE_QUERY = gql`
  query ValidateJoinCode($joinCode: String!) {
    validateJoinCode(joinCode: $joinCode) {
      isValid
    }
  }
`;

const CREATE_TRIP_MUTATION = gql`
  mutation CreateTrip($input: TripInput!) {
    createTrip(input: $input) {
      id
      country
      city
      joinCode
      latitude
      longitude
      timezone
    }
  }
`;

const CreateTripPage = () => {
  const [latitude, setLatitude] = useState(0); // Default latitude
  const [longitude, setLongitude] = useState(0); // Default longitude
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoinCodeValid, setIsJoinCodeValid] = useState(true);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API!,
      version: 'weekly',
    });

    loader
      .load()
      .then(async () => {
        const { Map } = (await google.maps.importLibrary(
          'maps'
        )) as google.maps.MapsLibrary;

        const mapID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
        const mapInstance = new Map(
          document.getElementById('map') as HTMLElement,
          {
            center: { lat: latitude, lng: longitude },
            zoom: 1,
            mapId: mapID,
          }
        );
        setMap(mapInstance);
      })
      .catch((e) => {
        console.error('Failed to load Google Maps API:', e);
        setError('Failed to load Google Maps API');
      });
  }, []);

  const handleSearchLocation = async () => {
    const addressInput = document.getElementById('address') as HTMLInputElement;
    const address = addressInput.value;

    try {
      const response = await fetch('/api/gc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (data.latitude && data.longitude) {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setCountry(data.country || '');
        setCity(data.city || '');

        if (map) {
          const location = { lat: data.latitude, lng: data.longitude };
          map.setCenter(location);

          const { AdvancedMarkerElement, PinElement } =
            (await google.maps.importLibrary(
              'marker'
            )) as google.maps.MarkerLibrary;

          const pin = new PinElement({
            background: 'red',
          });

          new AdvancedMarkerElement({
            map,
            position: location,
            content: pin.element,
            title: address,
          });
        }
      } else {
        setError('Failed to fetch geocode data');
      }
    } catch (err) {
      console.error('Failed to fetch geocode:', err);
      setError('Failed to fetch geocode data');
    }
  };

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newJoinCode = e.target.value.toUpperCase();
    setJoinCode(newJoinCode);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    setDebounceTimeout(
      setTimeout(() => {
        if (newJoinCode) {
          validateJoinCode(newJoinCode);
        }
      }, 1000)
    );
  };

  const validateJoinCode = async (code: string) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('Authorization token not found');
        setIsJoinCodeValid(false);
        return;
      }

      const variables = { joinCode: code };
      const response = await sendApolloRequest(
        VALIDATE_JOIN_CODE_QUERY,
        variables
      );
      const isValid = response.data.validateJoinCode.isValid;
      setIsJoinCodeValid(isValid);
    } catch (err) {
      console.error('Failed to validate join code:', err);
      setIsJoinCodeValid(false);
    }
  };

  const fetchTimezone = async () => {
    try {
      const response = await fetch('/api/tz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      if (data.timezone) {
        setTimezone(data.timezone); // Update the state
        return data.timezone; // Return the fetched timezone
      } else {
        setTimezone(''); // Reset the state if invalid data
        console.error('Invalid timezone data:', data);
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch timezone:', err);
      setTimezone(''); // Reset the state in case of an error
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!latitude || !longitude || !country) {
      setError('Please select a valid location.');
      return;
    }
    if (joinCode && !isJoinCodeValid) {
      setError('The provided join code is invalid.');
      return;
    }

    setError('');
    const timezoneValue = await fetchTimezone();

    if (!timezoneValue) {
      setError('Failed to fetch timezone.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = jwtDecode<{ exp: number } & User>(token);
      const userId = user.id;

      if (!userId) {
        setError('User is not logged in.');
        return;
      }

      const variables = {
        input: {
          userIds: [userId],
          joinCode: joinCode || '',
          country,
          city,
          latitude,
          longitude,
          timezone: timezoneValue,
        },
      };

      const response = await sendApolloRequest(CREATE_TRIP_MUTATION, variables);

      if (response.data.createTrip) {
        const tripId = response.data.createTrip.id;
        router.push(`/trips/${tripId}`); // Navigate to the new trip's page
      } else {
        setError('Failed to create trip.');
      }
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError('Failed to create trip.');
    }
  };

  return (
    <div>
      <h1>Create a New Trip</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '10px' }}>
        <input
          id="address"
          type="text"
          placeholder="Enter a location"
          style={{ width: '300px', padding: '5px', marginRight: '10px' }}
        />
        <button onClick={handleSearchLocation}>Search</button>
      </div>
      <div
        id="map"
        style={{ height: '400px', width: '100%', border: '1px solid #ddd' }}
      ></div>
      <div>
        <label>
          Custom Join Code (Optional):
          <input
            type="text"
            value={joinCode}
            onChange={handleJoinCodeChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
        {!isJoinCodeValid && (
          <p style={{ color: 'red' }}>Join code is invalid</p>
        )}
      </div>
      <p>
        Selected Location: Latitude {latitude}, Longitude {longitude}
      </p>
      <button onClick={handleSubmit} style={{ marginTop: '10px' }}>
        Create Trip
      </button>
    </div>
  );
};

export default CreateTripPage;
