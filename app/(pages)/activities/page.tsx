'use client';

import { useEffect, useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { jwtDecode } from 'jwt-decode';
import { User, Activity } from '../_types';
import { GET_USER_ACTIVITIES } from '../_utils/queries';
import styles from './activities.module.scss';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log(response);
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
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!activities.length) {
    return <p>No activities found.</p>;
  }

  return (
    <div>
      <h1>Your Activities</h1>
      {activities.map((activity) => (
        <div
          key={activity.id}
          style={{
            margin: '1rem 0',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h2>{activity.activityName}</h2>
          {activity.notes && (
            <p>
              <strong>Notes:</strong> {activity.notes}
            </p>
          )}
          <p>
            <strong>Time:</strong>{' '}
            {new Date(activity.startTime).toLocaleString()} -{' '}
            {new Date(activity.endTime).toLocaleString()}
          </p>
          <p>
            <strong>Location:</strong> {activity.city}, {activity.country}
          </p>
          <p>
            <strong>Address:</strong> {activity.address || 'N/A'}
          </p>
          <p>
            <strong>Categories:</strong> {activity.categories.join(', ')}
          </p>
          <p>
            <strong>Coordinates:</strong> {activity.latitude},{' '}
            {activity.longitude}
          </p>
          <p>
            <strong>Average Score:</strong> {activity.avgScore || 'N/A'}
          </p>
          <p>
            <strong>Number of Votes:</strong> {activity.numVotes || 0}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ActivitiesPage;
