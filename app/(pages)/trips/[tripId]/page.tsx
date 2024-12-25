'use client';

import { useEffect, useState } from 'react';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../_types'

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

const DELETE_TRIP_MUTATION = gql`
  mutation DeleteTrip($tripId: ID!) {
    deleteTrip(id: $tripId)
  }
`;

const CAST_VOTE_MUTATION = gql`
  mutation CastVote($activityId: ID!, $input: VoteInput!) {
    castVote(activityId: $activityId, input: $input) {
      id
      avgScore
      numVotes
    }
  }
`;

const TripDetailsPage = ({ params }: { params: { tripId: string } }) => {
  const [trip, setTrip] = useState(null);
  const [timezone, setTimezone] = useState(0);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const router = useRouter();
  const tripId = params.tripId;

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const variables = { tripId };
        const response = await sendApolloRequest(GET_TRIP_DETAILS, variables);
        if (response.data.trip) {
          setTrip(response.data.trip);
          setTimezone(response.data.trip.trip.timezone);
        } else {
          setError('Trip not found.');
        }
      } catch (err) {
        console.error('Failed to fetch trip details:', err);
        setError('Failed to fetch trip details.');
      }
    };

    fetchTripDetails();
  }, [tripId]);

  useEffect(() => {
    if (trip && trip.trip) {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API!,
        version: 'weekly',
      });

      loader.load().then(() => {
        const { Map } = google.maps;
        const mapID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
        const mapInstance = new Map(
          document.getElementById('map') as HTMLElement,
          {
            center: {
              lat: trip.trip.latitude,
              lng: trip.trip.longitude,
            },
            zoom: 11,
            mapId: mapID,
          }
        );
        setMap(mapInstance);
      });
    }
  }, [trip]);

  const addMarkers = async () => {
    if (map && trip.activities) {
      const { AdvancedMarkerElement, PinElement } =
        await google.maps.importLibrary('marker');
      trip.activities.forEach((activity) => {

        const location = {
          lat: activity.latitude,
          lng: activity.longitude,
        };

        const pin = new PinElement({
          glyphColor: 'white',
          background: 'blue',
        });

        const marker = new AdvancedMarkerElement({
          map,
          position: location,
          content: pin.element,
          title: activity.activityName,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3>${activity.activityName}</h3>
              <p><strong>Start:</strong> ${formatTimestamp(activity.startTime)}</p>
              <p><strong>End:</strong> ${formatTimestamp(activity.endTime)}</p>
              <p><strong>Notes:</strong> ${activity.notes || 'N/A'}</p>
              <p><strong>Categories:</strong> ${activity.categories.join(', ')}</p>
              <p><strong>Average Score:</strong> ${activity.avgScore || 'N/A'}</p>
              <p><strong>Number of Voters:</strong> ${activity.numVotes || 0}</p>
              <label>Rate this activity:</label>
              <input type="number" id="rating-${activity.id}" min="0" max="5" step="0.5">
              <button id="vote-button-${activity.id}">Vote</button>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);

          // Dynamically bind the vote functionality
          setTimeout(() => {
            const voteButton = document.getElementById(`vote-button-${activity.id}`);
            if (voteButton) {
              voteButton.onclick = () => castVote(activity.id);
            }
          }, 100); // Slight delay to ensure DOM is updated
        });
      });
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    let timestampNumeric = Number(timestamp);
    let timezoneNumeric = Number(timezone);
    let time = timestampNumeric+timezoneNumeric;
    const date = new Date(
      time
    );
    return `${date.toLocaleTimeString()} on ${date.toLocaleDateString()}`;
  };

  const castVote = async (activityId: string) => {
    const ratingInput = document.getElementById(
      `rating-${activityId}`
    ) as HTMLInputElement;
    const rating = parseFloat(ratingInput.value);

    if (!rating || rating < 0 || rating > 5) {
      alert('Please provide a valid rating between 0 and 5.');
      return;
    }
    const token = localStorage.getItem('token');
    const user = jwtDecode<{ exp: number } & User>(token);
    const userId = user.id;

    try {
      const variables = { activityId, input: { userId, score: rating } };
      const response = await sendApolloRequest(CAST_VOTE_MUTATION, variables);
      if (response.data.castVote) {
        alert('Thanks for voting!');
      } else {
        alert('Failed to submit your vote.');
      }
    } catch (err) {
      console.error('Error voting activity:', err);
    }
  };

  useEffect(() => {
    if (map) {
      addMarkers();
    }
  }, [map]);

  const handleCopyToClipboard = () => {
    if (trip?.trip.joinCode) {
      navigator.clipboard.writeText(trip.trip.joinCode).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(null), 2000);
      });
    }
  };

  const handleDeleteTrip = async () => {
    try {
      const variables = { tripId };
      const response = await sendApolloRequest(DELETE_TRIP_MUTATION, variables);
      if (response.data.deleteTrip) {
        alert('Trip deleted successfully!');
        router.push('/trips');
      } else {
        setError('Failed to delete trip.');
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
      setError('Failed to delete trip.');
    }
  };

  if (!trip) return <p>Loading...</p>;

  return (
    <div>
      <h1>Trip Details</h1>
      <p>Country: {trip.trip.country}</p>
      <p>City: {trip.trip.city || 'N/A'}</p>
      <p>
        Join Code:
        <span
          onClick={handleCopyToClipboard}
          style={{
            display: 'inline-block',
            padding: '5px 10px',
            marginLeft: '10px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Click to copy"
        >
          {trip.trip.joinCode}
        </span>
        {copySuccess && <span style={{ marginLeft: '10px', color: 'green' }}>{copySuccess}</span>}
      </p>
      <p>Timezone: {trip.trip.timezone}</p>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
      <button
        onClick={handleDeleteTrip}
        style={{
          marginTop: '20px',
          backgroundColor: '#d9534f',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Delete Trip
      </button>
    </div>
  );
};

export default TripDetailsPage;
