'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTripActivities } from '@utils/fetchTripActivities';
import { Activity } from '@utils/typeDefs';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import styles from './tripActivities.module.scss';

const TripActivitiesPage = ({ params }: { params: { tripId: string } }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const tripId = params.tripId;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const fetchedActivities = await fetchTripActivities(tripId);
        setActivities(fetchedActivities);
        console.log(fetchedActivities);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('An error occurred while fetching activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [tripId]);

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography className={styles.error}>{error}</Typography>;
  }

  return (
    <Box className={styles.pageContainer}>
      <Button
        variant="outlined"
        onClick={() => router.push(`/trips/${tripId}`)}
        className={styles.backButton}
      >
        Back to Trip Details
      </Button>
      <Typography variant="h4" className={styles.title}>
        Trip Activities
      </Typography>
      <Box className={styles.activitiesContainer}>
        {activities.map((activity) => (
          <Card key={activity.id} className={styles.activityCard}>
            <CardContent>
              <Typography variant="h6">{activity.activityName}</Typography>
              {activity.notes && (
                <Typography>Notes: {activity.notes}</Typography>
              )}
              <Typography>
                Time: {new Date(activity.startTime).toLocaleString()} -{' '}
                {new Date(activity.endTime).toLocaleString()}
              </Typography>
              <Typography>
                Location: {activity.city}, {activity.country}
              </Typography>
              <Typography>Address: {activity.address || 'N/A'}</Typography>
              <Typography>
                Categories: {activity.categories.join(', ')}
              </Typography>
              <Typography>
                Coordinates: {activity.latitude}, {activity.longitude}
              </Typography>
              <Typography>
                Average Score: {activity.avgScore || 'N/A'}
              </Typography>
              <Typography>Number of Votes: {activity.numVotes || 0}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default TripActivitiesPage;
