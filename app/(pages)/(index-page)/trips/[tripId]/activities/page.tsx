'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTripActivities } from '@utils/fetchTripActivities';
import { Activity } from '@utils/typeDefs';
import PageHeader from '@components/PageHeader/PageHeader';
import ActivityCard from '@components/ActivityCard/ActivityCard';
import EmptyState from '@components/EmptyState/EmptyState';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';
import { HiOutlineCalendar } from 'react-icons/hi';

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

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader
        title="Trip Activities"
        onBack={() => router.push(`/trips/${tripId}`)}
      />

      {activities.length === 0 ? (
        <EmptyState
          icon={HiOutlineCalendar}
          title="No activities yet"
          description="Create your first activity to start planning this trip."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TripActivitiesPage;
