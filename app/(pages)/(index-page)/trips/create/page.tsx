'use client';

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import sendApolloRequest from '@utils/sendApolloRequest';
import fetchTimezone from '@utils/fetchTimezone';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User } from '@utils/typeDefs';
import { CREATE_TRIP_MUTATION } from '@utils/queries';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from './createTrip.module.scss';

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
    <Box className={styles.pageContainer}>
      <Button
        className={styles.backButton}
        startIcon={<AiOutlineArrowLeft />}
        onClick={() => router.back()}
        variant="outlined"
      >
        Back
      </Button>
      <Typography variant="h4" className={styles.title}>
        Create a New Trip
      </Typography>
      {error && <Typography className={styles.error}>{error}</Typography>}
      <Box className={styles.formContainer}>
        <TextField
          id="address"
          label="Enter a Location"
          variant="outlined"
          fullWidth
          className={styles.input}
        />
        <Button
          variant="contained"
          onClick={handleSearchLocation}
          className={styles.searchButton}
        >
          {loading ? <CircularProgress size={24} /> : 'Search Location'}
        </Button>
      </Box>
      <Box id="map" className={styles.map} />
      {country && (
        <Typography variant="body2" className={styles.locationInfo}>
          {city ? city + ', ' : ''}
          {country} - Latitude: {latitude}, Longitude: {longitude}
        </Typography>
      )}
      <Box className={styles.joinCodeContainer}>
        <InputLabel htmlFor="joinCode">Custom Join Code (Optional)</InputLabel>
        <TextField
          id="joinCode"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          fullWidth
          error={!isJoinCodeValid}
          helperText={!isJoinCodeValid && 'Invalid join code'}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        className={styles.submitButton}
      >
        Create Trip
      </Button>
    </Box>
  );
};

export default CreateTripPage;
