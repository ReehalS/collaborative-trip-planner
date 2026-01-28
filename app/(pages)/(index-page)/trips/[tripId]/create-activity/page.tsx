'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { jwtDecode } from 'jwt-decode';
import { fetchTripDetails } from '@utils/fetchTripDetails';
import { CREATE_ACTIVITY_MUTATION } from '@utils/queries';
import sendApolloRequest from '@utils/sendApolloRequest';
import { TextField, Button, Alert } from '@mui/material';
import { Trip, Activity, User } from '@utils/typeDefs';
import PageHeader from '@components/PageHeader/PageHeader';

const CreateActivityPage = ({ params }: { params: { tripId: string } }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [, setActivities] = useState<Activity[]>([]);
  const [activityName, setActivityName] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [searchLocation, setSearchLocation] = useState('');
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.tripId;

  // Pre-fill activity name from query param (e.g. from AI suggestion)
  useEffect(() => {
    const name = searchParams.get('name');
    if (name) setActivityName(name);
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTripDetails(tripId, setTrip, setActivities, setError);

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
            center: { lat: trip?.latitude || 0, lng: trip?.longitude || 0 },
            zoom: 11,
            mapId: mapID,
          }
        );
        setMap(mapInstance);
      })
      .catch((e) => {
        console.error('Failed to load Google Maps API:', e);
        setError('Failed to load Google Maps API');
      });
  }, [tripId, router, trip?.latitude, trip?.longitude]);

  const handleSearchLocation = async () => {
    let queryAddress = searchLocation;

    if (trip?.city) queryAddress += ` ${trip.city}`;
    queryAddress += ` ${trip?.country}`;

    try {
      const response = await fetch('/api/gc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: queryAddress }),
      });

      const data = await response.json();

      if (data.latitude && data.longitude) {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setAddress(data.address);
        setCategories(data.categories || []);

        if (map) {
          const location = { lat: data.latitude, lng: data.longitude };
          map.setCenter(location);

          const { AdvancedMarkerElement, PinElement } =
            (await google.maps.importLibrary(
              'marker'
            )) as google.maps.MarkerLibrary;

          if (marker) {
            marker.setMap(null);
          }

          const pin = new PinElement({
            glyphColor: 'white',
            background: 'red',
          });

          const newMarker = new AdvancedMarkerElement({
            map,
            position: location,
            content: pin.element,
            title: queryAddress,
          });

          setMarker(newMarker);
        }
      } else {
        setError('Failed to fetch geocode data');
      }
    } catch (err) {
      console.error('Failed to fetch geocode:', err);
      setError('Failed to fetch geocode data');
    }
  };

  const handleAutofill = async () => {
    if (!address || !activityName) return;
    setAutofillLoading(true);
    try {
      const res = await fetch('/api/ai/autofill-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: activityName || searchLocation,
          address,
          tripCity: trip?.city,
          tripCountry: trip?.country,
        }),
      });
      const data = await res.json();
      if (data.notes) setNotes(data.notes);
      if (data.categories) setCategories(data.categories);
      if (data.suggestedStartTime && !startTime) {
        // Build a date string for today with the suggested time
        const today = new Date().toISOString().split('T')[0];
        setStartTime(`${today}T${data.suggestedStartTime}`);
      }
      if (data.suggestedEndTime && !endTime) {
        const today = new Date().toISOString().split('T')[0];
        setEndTime(`${today}T${data.suggestedEndTime}`);
      }
    } catch (err) {
      console.error('AI autofill error:', err);
    } finally {
      setAutofillLoading(false);
    }
  };

  const validateTimes = (startTime: string, endTime: string) => {
    if (startTime && endTime && new Date(endTime) < new Date(startTime)) {
      setTimeError('End time cannot be earlier than start time.');
      return false;
    }
    setTimeError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!activityName || !startTime || !endTime || !trip?.country) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateTimes(startTime, endTime)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const user = jwtDecode<{ exp: number } & User>(token);
      const suggesterId = user.id;

      if (!suggesterId) {
        setError('User is not logged in.');
        return;
      }

      const variables = {
        input: {
          tripId,
          suggesterId,
          activityName,
          notes,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          city: trip.city || '',
          country: trip.country,
          timezone: trip.timezone,
          latitude,
          longitude,
          address,
          categories,
        },
      };

      const response = await sendApolloRequest(
        CREATE_ACTIVITY_MUTATION,
        variables
      );

      if (response.data.createActivity) {
        router.push(`/trips/${tripId}`);
      } else {
        setError('Failed to create activity.');
      }
    } catch (err) {
      console.error('Failed to create activity:', err);
      setError('Failed to create activity.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader
        title="Create Activity"
        onBack={() => router.push(`/trips/${tripId}`)}
      />

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      {timeError && (
        <Alert severity="error" className="mb-4">
          {timeError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-card shadow-card p-6 space-y-4">
          <TextField
            label="Activity Name"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div className="flex gap-3">
            <TextField
              label="Search Location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSearchLocation}
              sx={{ minWidth: 100, flexShrink: 0 }}
            >
              Search
            </Button>
          </div>

          {address && (
            <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 rounded-btn px-3 py-2">
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
              <span>{address}</span>
            </div>
          )}

          {address && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleAutofill}
              disabled={autofillLoading}
              fullWidth
            >
              {autofillLoading ? 'Auto-filling...' : 'Auto-fill with AI'}
            </Button>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            size="large"
          >
            Create Activity
          </Button>
        </div>

        {/* Map */}
        <div
          id="map"
          className="h-[400px] lg:h-full lg:min-h-[500px] rounded-card border border-surface-200 overflow-hidden"
        />
      </div>
    </div>
  );
};

export default CreateActivityPage;
