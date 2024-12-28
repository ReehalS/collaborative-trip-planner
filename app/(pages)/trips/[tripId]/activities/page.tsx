'use client';

import { useEffect, useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { Activity } from '../../../_types';
import { GET_TRIP_ACTIVITIES } from '../../../_utils/queries';
import { useRouter } from 'next/navigation';

const TripActivitiesPage = ({ params }: { params: { tripId: string } }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const tripId = params.tripId;

  useEffect(() => {
    const fetchTripActivities = async () => {
      try {
        const variables = { tripId };
        const response = await sendApolloRequest(
          GET_TRIP_ACTIVITIES,
          variables
        );
        console.log(response);
        if (response?.data?.activities) {
          setActivities(response.data.activities);
        } else {
          setError('No activities found for this trip.');
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('An error occurred while fetching activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchTripActivities();
  }, [tripId]);

  const handleBackToTrip = () => {
    router.push(`/trips/${tripId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!activities.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No activities found for this trip.</p>
        <button onClick={handleBackToTrip}>Back to Trip Details</button>
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
        <h1>Trip Activities</h1>
        <button onClick={handleBackToTrip}>Back to Trip Details</button>
      </div>
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

export default TripActivitiesPage;
