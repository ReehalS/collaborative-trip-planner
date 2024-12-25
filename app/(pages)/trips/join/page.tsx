'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';

const FIND_TRIP_BY_JOIN_CODE = gql`
  query FindTripByJoinCode($joinCode: String!) {
    tripByJoinCode(joinCode: $joinCode) {
      id
      country
      city
    }
  }
`;

const JOIN_TRIP_MUTATION = gql`
  mutation JoinTrip($tripId: String!, $userId: String!) {
    joinTrip(tripId: $tripId, userId: $userId) {
      id
      role
    }
  }
`;

const JoinTripPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = async () => {
    try {
      console.log(joinCode)
      // Validate join code
      const findTripResponse = await sendApolloRequest(FIND_TRIP_BY_JOIN_CODE, {
        joinCode,
      });
      console.log(findTripResponse)
      const trip = findTripResponse.data.tripByJoinCode;

      if (!trip) {
        setError('Invalid join code.');
        return;
      }

      // Add user to trip
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      if (!userId) {
        setError('User is not logged in.');
        return;
      }

      await sendApolloRequest(JOIN_TRIP_MUTATION, {
        tripId: trip.id,
        userId,
      });

      router.push(`/trips/${trip.id}`);
    } catch (err) {
      console.error('Failed to join trip:', err);
      setError('Failed to join trip.');
    }
  };

  return (
    <div>
      <h1>Join a Trip</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter Join Code"
          style={{ width: '300px', padding: '5px', marginRight: '10px' }}
        />
        <button onClick={handleJoin}>Join</button>
      </div>
    </div>
  );
};

export default JoinTripPage;
