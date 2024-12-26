'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';
import { Loader } from '@googlemaps/js-api-loader';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../../_types'

const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: ActivityInput!) {
    createActivity(input: $input) {
      id
      tripId
      activityName
      suggesterId
      startTime
      endTime
      notes
      categories
      latitude
      longitude
      avgScore
      numVotes
    }
  }
`;

const GET_TRIP_DETAILS = gql`
  query GetTripDetails($tripId: ID!) {
    trip(id: $tripId) {
      trip {
        id
        country
        city
        joinCode
        latitude
        longitude
        timezone
      }
      activities {
        id
        activityName
        startTime
        endTime
        notes
        categories
        latitude
        longitude
        avgScore
        numVotes
      }
    }
  }
`;

const CreateActivityPage = ({ params }: { params: { tripId: string } }) => {
  const [activityName, setActivityName] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [tripLatitude, setTripLatitude] = useState(0);
  const [tripLongitude, setTripLongitude] = useState(0);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [activityCity, setActivityCity] = useState('');
  const [timezone, setTimezone] = useState('');
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  const router = useRouter();
  const tripId = params.tripId;

  const fetchTripDetails = async (tripId: string) => {
    try {
      const variables = { tripId };
      const response = await sendApolloRequest(GET_TRIP_DETAILS, variables);
      const data = response.data.trip.trip;

      if (data?.latitude && data?.longitude) {
        setTripLatitude(data.latitude);
        setTripLongitude(data.longitude);
        setCity(data.city || '');
        setCountry(data.country);
        setTimezone(data.timezone);
      } else {
        console.error('Invalid trip data received from GraphQL:', data);
      }
    } catch (err) {
      console.error('Failed to fetch trip details using GraphQL:', err);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripDetails(tripId);
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
            center: { lat: tripLatitude, lng: tripLongitude },
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
  }, [tripLatitude, tripLongitude]);

  const handleSearchLocation = async () => {
    const addressInput = document.getElementById('address') as HTMLInputElement;
    const addressValue = addressInput.value;
    let queryAddress = addressValue;

    if (city) {
      queryAddress += ` ${city}`;
    }
    queryAddress += ` ${country}`;
    
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
        setActivityCity(data.city || '');
        setAddress(data.address);
        setCategories(data.categories || []);

        if (map) {
          const location = { lat: data.latitude, lng: data.longitude };
          map.setCenter(location);

          const { AdvancedMarkerElement, PinElement } =
            (await google.maps.importLibrary(
              'marker'
            )) as google.maps.MarkerLibrary;

          // Remove the previous marker
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

          setMarker(newMarker); // Update the marker state
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
    setTimeError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!activityName || !startTime || !endTime || !country) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateTimes()) return;

    try {
      const token = localStorage.getItem('token');
      const user = jwtDecode<{ exp: number } & User>(token);
      const suggesterId = user.id;

      if (!suggesterId) {
        setError('User is not logged in.');
        return;
      }
      const finalCity = city || activityCity;

      // Convert datetime-local to ISO-8601 DateTime string
      const formattedStartTime = new Date(startTime).toISOString()
      const formattedEndTime = new Date(endTime).toISOString()

      const variables = {
        input: {
          tripId,
          suggesterId,
          activityName,
          notes,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          city: finalCity,
          country,
          timezone,
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
      console.log(response)
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
    <div>
      <h1>Create Activity</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {timeError && <p style={{ color: 'red' }}>{timeError}</p>}
      <div>
        <label>
          Activity Name:
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </label>
      </div>
      <div>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Search Location:
          <input id="address" type="text" />
          <button onClick={handleSearchLocation}>Search</button>
        </label>
      </div>
      <div>
        <p>
          <strong>Address:</strong> {address}
        </p>
        <p>
          <strong>Coordinates:</strong> Latitude: {latitude}, Longitude: {longitude}
        </p>
      </div>
      <div
        id="map"
        style={{ height: '400px', width: '100%', border: '1px solid #ddd' }}
      ></div>
      <button onClick={handleSubmit} style={{ marginTop: '10px' }}>
        Create Activity
      </button>
    </div>
  );
};

export default CreateActivityPage;
