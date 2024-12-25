'use client';

import { useEffect, useState } from 'react';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation'; // Import Next.js router
import { Trip } from '../_types';

const GET_USER_TRIPS = gql`
  query GetUserTrips($userId: String!) {
    userToTrips(filter: { userId: $userId }) {
      id
      trip {
        id
        country
        joinCode
      }
    }
  }
`;

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!userId) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }

        const variables = { userId };
        const response = await sendApolloRequest(GET_USER_TRIPS, variables);

        if (response.data.userToTrips) {
          setTrips(response.data.userToTrips.map((ut) => ut.trip) || []);
        }
      } catch (err) {
        setError('Failed to fetch trips.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleAddTrip = () => {
    router.push('/trips/create');
  };

  const handleJoinTrip = () => {
    router.push('/trips/join');
  };

  const handleViewTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!trips.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No trips found.</p>
        <button onClick={handleAddTrip}>Create a New Trip</button>
        <button onClick={handleJoinTrip} style={{ marginLeft: '1rem' }}>
          Join a Trip
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Your Trips</h1>
        <button onClick={handleAddTrip}>Create Trip</button>
      </div>
      {trips.map((trip) => (
        <div
          key={trip.id}
          style={{
            margin: '1rem 0',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
          }}
          onClick={() => handleViewTrip(trip.id)}
        >
          <h2>{trip.country}</h2>
          <p>Join Code: {trip.joinCode}</p>
        </div>
      ))}
    </div>
  );
};

export default TripsPage;
