'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import sendApolloRequest from '@utils/sendApolloRequest';
import fetchTimezone from '@utils/fetchTimezone';
import { useRouter } from 'next/navigation';
import { CREATE_TRIP_MUTATION } from '@utils/queries';
import { useDbUser } from '@hooks/useDbUser';
import { Button, TextField, CircularProgress } from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';
import { LuMapPin } from 'react-icons/lu';

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
  const [isJoinCodeValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dbUser, loading: authLoading } = useDbUser();
  const markerLibRef = useRef<google.maps.MarkerLibrary | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!dbUser) {
      router.push('/login');
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API!,
      version: 'weekly',
    });

    (async () => {
      try {
        const [mapsLib, markerLib] = await Promise.all([
          loader.importLibrary('maps'),
          loader.importLibrary('marker'),
        ]);
        markerLibRef.current = markerLib as google.maps.MarkerLibrary;

        const { Map } = mapsLib as google.maps.MapsLibrary;
        const mapID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
        const mapInstance = new Map(
          document.getElementById('map') as HTMLElement,
          {
            center: { lat: 0, lng: 0 },
            zoom: 1.5,
            mapId: mapID,
          }
        );
        setMap(mapInstance);
      } catch (e) {
        console.error('Failed to load Google Maps API:', e);
        setError('Failed to load Google Maps API');
      }
    })();
  }, [router, dbUser, authLoading]);

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

          const { AdvancedMarkerElement, PinElement } = markerLibRef.current!;

          const pin = new PinElement({
            glyphColor: 'white',
            background: '#f97316',
            borderColor: '#ea580c',
          });

          const newMarker = new AdvancedMarkerElement({
            map,
            position: location,
            content: pin.element,
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

      if (!dbUser) return;
      const userId = dbUser.id;

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

      <div className="bg-white rounded-card shadow-card border border-stone-200/60 border-t-4 border-t-primary-400 p-6 space-y-5">
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
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Map */}
        <div
          id="map"
          className="h-[400px] w-full rounded-card border border-stone-200 overflow-hidden shadow-card"
        />

        {/* Location result */}
        {country && (
          <div className="flex items-center gap-2 text-sm text-surface-600 bg-stone-50 border border-stone-200 rounded-btn px-4 py-2.5">
            <LuMapPin className="w-4 h-4 text-accent-500 flex-shrink-0" />
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
