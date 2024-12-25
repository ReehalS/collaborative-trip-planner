'use client';

import { useEffect, useState } from 'react';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation';

const GET_TRIP_DETAILS = gql`
  query GetTripDetails($tripId: ID!) {
    trip(id: $tripId) {
      id
      country
      city
      joinCode
      latitude
      longitude
      timezone
      activities {
        activity {
          id
          activityName
          address
          startTime
          endTime
        }
      }
    }
  }
`;

const DELETE_TRIP_MUTATION = gql`
  mutation DeleteTrip($tripId: ID!) {
    deleteTrip(id: $tripId)
  }
`;

const TripDetailsPage = ({ params }: { params: { tripId: string } }) => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const router = useRouter();
  const tripId = params.tripId;

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const variables = { tripId };
        const response = await sendApolloRequest(GET_TRIP_DETAILS, variables);
        console.log(response)
        if (response.data.trip) {
          setTrip(response.data.trip);
        } else {
          setError('Trip not found.');
        }
      } catch (err) {
        console.error('Failed to fetch trip details:', err);
        setError('Failed to fetch trip details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  const handleCopyToClipboard = () => {
    if (trip?.joinCode) {
      navigator.clipboard.writeText(trip.joinCode).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(null), 2000); // Clear message after 2 seconds
      });
    }
  };

  const handleDeleteTrip = async () => {
    try {
      const variables = { tripId };
      const response = await sendApolloRequest(DELETE_TRIP_MUTATION, variables);
      console.log(response);
      if (response.data.deleteTrip) {
        alert('Trip deleted successfully!');
        router.push('/trips'); // Navigate back to the trips list
      } else {
        setError('Failed to delete trip.');
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
      setError('Failed to delete trip.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!trip) {
    return <p>Trip not found.</p>;
  }

  return (
    <div>
      <button
        onClick={() => router.push('/trips')}
        style={{ marginBottom: '1rem' }}
      >
        Back to Trips
      </button>
      <h1>Trip to {trip.country}</h1>
      <p>City: {trip.city || 'N/A'}</p>
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
          {trip.joinCode}
        </span>
        {copySuccess && (
          <span style={{ marginLeft: '10px', color: 'green' }}>
            {copySuccess}
          </span>
        )}
      </p>
      <p>Timezone: {trip.timezone}</p>
      <p>
        Location: {trip.latitude}, {trip.longitude}
      </p>
      <h2>Activities</h2>
      {trip.activities && trip.activities.length ? (
        trip.activities.map((activity) => (
          <div key={activity.id}>
            <p>
              {activity.activityName} ({activity.startTime} -{' '}
              {activity.endTime})
            </p>
          </div>
        ))
      ) : (
        <p>No activities found.</p>
      )}
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
