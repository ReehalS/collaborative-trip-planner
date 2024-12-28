'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import sendApolloRequest from '@utils/sendApolloRequest';
import { jwtDecode } from 'jwt-decode';
import { User } from '@utils/typeDefs';
import { FIND_TRIP_BY_JOIN_CODE, JOIN_TRIP_MUTATION } from '@utils/queries';
import { Box, TextField, Button, Typography } from '@mui/material';
import styles from './joinTrip.module.scss';

const JoinTripPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

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
      if (!token) return;
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
    <Box className={styles.pageContainer}>
      <Typography variant="h4" className={styles.title}>
        Join a Trip
      </Typography>
      {error && (
        <Typography variant="body1" color="error" className={styles.error}>
          {error}
        </Typography>
      )}
      <Box className={styles.inputContainer}>
        <TextField
          label="Join Code"
          variant="outlined"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter Join Code"
          className={styles.inputField}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleJoin}
          className={styles.joinButton}
        >
          Join
        </Button>
      </Box>
    </Box>
  );
};

export default JoinTripPage;
