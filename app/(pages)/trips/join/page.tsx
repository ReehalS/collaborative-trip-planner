'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import sendApolloRequest from '@utils/sendApolloRequest';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../_types'
import { FIND_TRIP_BY_JOIN_CODE, JOIN_TRIP_MUTATION } from '../../_utils/queries';

const JoinTripPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = async () => {
    try {
      const findTripResponse = await sendApolloRequest(FIND_TRIP_BY_JOIN_CODE, {
        joinCode,
      });

      const trip = findTripResponse.data.tripByJoinCode;

      if (!trip) {
        setError('Invalid join code.');
        return;
      }

      const token = localStorage.getItem('token');
      if(!token) return;
      const user = jwtDecode<{ exp: number } & User>(token);
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
