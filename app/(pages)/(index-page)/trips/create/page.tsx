'use client';

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import sendApolloRequest from '@utils/sendApolloRequest';
import fetchTimezone from '@utils/fetchTimezone';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User } from '@utils/typeDefs';
import { CREATE_TRIP_MUTATION } from '@utils/queries';
import { Button, TextField, CircularProgress } from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';

const CreateTripPage = () => {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoinCodeValid, setIsJoinCodeValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }

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
            zoom: 1.5,
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
      setLoading(true);
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

          if (marker) {
            marker.map = null;
          }

          const { AdvancedMarkerElement } = (await google.maps.importLibrary(
            'marker'
          )) as google.maps.MarkerLibrary;

          const newMarker = new AdvancedMarkerElement({
            map,
            position: location,
            title: address,
          });

          setMarker(newMarker);

          map.setCenter(location);
        }
      } else {
        setError('Failed to fetch geocode data');
      }
    } catch (err) {
      console.error('Failed to fetch geocode:', err);
      setError('Failed to fetch geocode data');
    } finally {
      setLoading(false);
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
    try {
      setLoading(true);
      const timezoneValue = await fetchTimezone(latitude, longitude);
      if (!timezoneValue) {
        setError('Failed to fetch timezone.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;
      const user = jwtDecode<{ exp: number } & User>(token);
      const userId = user.id;

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
        router.push(`/trips/${tripId}`);
      } else {
        setError('Failed to create trip.');
      }
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError('Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader title="Create a New Trip" />

      {error && (
        <div className="bg-error-light text-error-dark rounded-btn px-4 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-card shadow-card p-6 space-y-5">
        {/* Location search */}
        <div className="flex gap-3">
          <TextField
            id="address"
            label="Search for a location"
            variant="outlined"
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSearchLocation}
            disabled={loading}
            sx={{ minWidth: 140, flexShrink: 0 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
          </Button>
        </div>

        {/* Map */}
        <div
          id="map"
          className="h-[400px] w-full rounded-card border border-surface-200 overflow-hidden"
        />

        {/* Location result */}
        {country && (
          <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 rounded-btn px-4 py-2.5">
            <svg
              className="w-4 h-4 text-primary-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {city ? `${city}, ` : ''}
              {country}
            </span>
          </div>
        )}

        {/* Join code */}
        <div>
          <TextField
            id="joinCode"
            label="Custom Join Code (Optional)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            fullWidth
            size="small"
            error={!isJoinCodeValid}
            helperText={!isJoinCodeValid && 'Invalid join code'}
          />
        </div>

        {/* Submit */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Trip'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateTripPage;
