'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import sendApolloRequest from '@utils/sendApolloRequest';
import { jwtDecode } from 'jwt-decode';
import { User, Activity } from '@utils/typeDefs';
import { GET_USER_ACTIVITIES } from '@utils/queries';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from './activities.module.scss';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated.');
          return;
        }

        const user = jwtDecode<{ exp: number } & User>(token);
        const userId = user.id;

        if (!userId) {
          setError('User ID not found.');
          return;
        }

        const variables = { userId };
        const response = await sendApolloRequest(
          GET_USER_ACTIVITIES,
          variables
        );

        if (response?.data?.activities) {
          setActivities(response.data.activities);
        } else {
          setError('No activities found.');
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('An error occurred while fetching activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography className={styles.errorMessage}>
        {error}
      </Typography>
    );
  }

  if (!activities.length) {
    return (
      <Typography className={styles.noActivitiesMessage}>
        No activities found.
      </Typography>
    );
  }

  return (
    <Box className={styles.activitiesContainer}>
      <Button
        startIcon={<AiOutlineArrowLeft />}
        onClick={() => router.push('/')}
        variant="outlined"
        className={styles.backButton}
      >
        Back
      </Button>
      <Typography variant="h4" className={styles.pageTitle}>
        Your Activities
      </Typography>
      <Box className={styles.activitiesList}>
        {activities.map((activity) => (
          <Card key={activity.id} className={styles.activityCard}>
            <CardContent>
              <Typography variant="h6" className={styles.activityTitle}>
                {activity.activityName}
              </Typography>
              {activity.notes && (
                <Typography>
                  <strong>Notes:</strong> {activity.notes}
                </Typography>
              )}
              <Typography>
                <strong>Time:</strong>{' '}
                {new Date(activity.startTime).toLocaleString()} -{' '}
                {new Date(activity.endTime).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Location:</strong> {activity.city}, {activity.country}
              </Typography>
              <Typography>
                <strong>Address:</strong> {activity.address || 'N/A'}
              </Typography>
              <Typography>
                <strong>Categories:</strong> {activity.categories.join(', ')}
              </Typography>
              <Typography>
                <strong>Coordinates:</strong> {activity.latitude},{' '}
                {activity.longitude}
              </Typography>
              <Typography>
                <strong>Average Score:</strong> {activity.avgScore || 'N/A'}
              </Typography>
              <Typography>
                <strong>Number of Votes:</strong> {activity.numVotes || 0}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ActivitiesPage;
