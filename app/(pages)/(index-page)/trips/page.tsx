'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Trip, User } from '@utils/typeDefs';
import sendApolloRequest from '@utils/sendApolloRequest';
import { GET_USER_TRIPS } from '@utils/queries';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from './trips.module.scss';

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
        }
        const user = jwtDecode<{ exp: number } & User>(token);
        const userId = user.id;

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
    return <Typography className={styles.message}>Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography className={styles.message} color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box className={styles.pageContainer}>
      <Box className={styles.header}>
        <Button
          className={styles.backButton}
          onClick={() => router.back()}
          startIcon={<AiOutlineArrowLeft />}
          variant='outlined'
        >
          Back
        </Button>
        <Typography variant="h4">Your Trips</Typography>
        {trips.length !== 0 ? (
          <Box className={styles.navButtons}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTrip}
            className={styles.createButton}
          >
            Create Trip
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleJoinTrip}
            className={styles.joinButton}
          >
            Join Trip
          </Button>
        </Box>
        ) : (
        <Box className={styles.navButtonsBlank}></Box>
          )}
      </Box>

      {/* Content */}
      {trips.length === 0 ? (
        <Box className={styles.noTrips}>
          <Typography>No trips found.</Typography>
          <Button variant="contained" onClick={handleAddTrip}>
            Create a New Trip
          </Button>
          <Button
            variant="outlined"
            onClick={handleJoinTrip}
            className={styles.joinButton}
          >
            Join a Trip
          </Button>
        </Box>
      ) : (
        <Box className={styles.tripsContainer}>
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className={styles.tripCard}
              onClick={() => handleViewTrip(trip.id)}
            >
              <CardContent>
                <Typography variant="h5">
                  {trip.city ? `${trip.city}, ${trip.country}` : trip.country}
                </Typography>
                <Typography variant="body2">
                  Join Code: {trip.joinCode}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TripsPage;
