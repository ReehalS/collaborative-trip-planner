'use client';

import { useEffect, useState } from 'react';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';
import { Activity } from '../_types';

const GET_ACTIVITIES_BY_USER = gql`
  query GetActivitiesByUser($userId: String!) {
    activitiesByUser(userId: $userId) {
      id
      activityName
      notes
    }
  }
`;

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!userId) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }

        const variables = { userId };

        const response = await sendApolloRequest(
          GET_ACTIVITIES_BY_USER,
          variables
        );

        setActivities(response.activitiesByUser || []);
      } catch (err) {
        setError('Failed to fetch activities.');
        console.error(err);
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
        <div key={activity.id} style={{ margin: '1rem 0' }}>
          <h2>{activity.activityName}</h2>
          {activity.notes ? <p>{activity.notes}</p> : null}
        </div>
      ))}
    </div>
  );
};

export default ActivitiesPage;
