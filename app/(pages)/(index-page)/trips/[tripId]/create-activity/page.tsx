'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { jwtDecode } from 'jwt-decode';
import { fetchTripDetails } from '@utils/fetchTripDetails';
import { CREATE_ACTIVITY_MUTATION } from '@utils/queries';
import sendApolloRequest from '@utils/sendApolloRequest';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  TextareaAutosize,
} from '@mui/material';
import { Trip, Activity, User } from '@utils/typeDefs';
import styles from './createActivity.module.scss';

const CreateActivityPage = ({ params }: { params: { tripId: string } }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
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
  const router = useRouter();
  const tripId = params.tripId;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch trip details and activities
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

  const validateTimes = () => {
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

    if (!validateTimes()) return;

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
        alert('Activity created successfully!');
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
    <Box className={styles.pageContainer}>
      <Typography variant="h4" className={styles.title}>
        Create Activity
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {timeError && <Alert severity="error">{timeError}</Alert>}
      <TextField
        label="Activity Name"
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextareaAutosize
        minRows={3}
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={styles.textarea}
      />
      <TextField
        label="Start Time"
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        fullWidth
        margin="normal"
        required
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End Time"
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        fullWidth
        margin="normal"
        required
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Search Location"
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        onClick={handleSearchLocation}
        className={styles.searchButton}
      >
        Search Location
      </Button>
      <div id="map" className={styles.map} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        className={styles.submitButton}
      >
        Create Activity
      </Button>
    </Box>
  );
};

export default CreateActivityPage;
