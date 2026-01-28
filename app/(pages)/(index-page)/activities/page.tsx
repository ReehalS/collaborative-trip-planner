'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import sendApolloRequest from '@utils/sendApolloRequest';
import { jwtDecode } from 'jwt-decode';
import { User, Activity } from '@utils/typeDefs';
import { GET_USER_ACTIVITIES } from '@utils/queries';
import PageHeader from '@components/PageHeader/PageHeader';
import ActivityCard from '@components/ActivityCard/ActivityCard';
import EmptyState from '@components/EmptyState/EmptyState';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';
import { HiOutlineCalendar } from 'react-icons/hi';

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
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-error-light text-error-dark rounded-btn px-4 py-3 text-sm text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <PageHeader title="Your Activities" onBack={() => router.push('/')} />
        <EmptyState
          icon={HiOutlineCalendar}
          title="No activities yet"
          description="Activities you create or join through trips will appear here."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader title="Your Activities" onBack={() => router.push('/')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default ActivitiesPage;
