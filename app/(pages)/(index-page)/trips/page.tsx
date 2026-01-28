'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Trip, User } from '@utils/typeDefs';
import sendApolloRequest from '@utils/sendApolloRequest';
import { GET_USER_TRIPS } from '@utils/queries';
import { Button } from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';
import EmptyState from '@components/EmptyState/EmptyState';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';
import { AiOutlinePlus, AiOutlineTeam } from 'react-icons/ai';
import { HiOutlineGlobeAlt, HiOutlineChevronRight, HiOutlineCalendar } from 'react-icons/hi';

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto w-full px-6 py-8">
        <div className="bg-error-light text-error-dark rounded-btn px-4 py-3 text-sm text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader
        title="Your Trips"
        onBack={() => router.push('/')}
        actions={
          trips.length > 0 ? (
            <>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AiOutlinePlus />}
                onClick={() => router.push('/trips/create')}
              >
                Create Trip
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AiOutlineTeam />}
                onClick={() => router.push('/trips/join')}
              >
                Join Trip
              </Button>
            </>
          ) : undefined
        }
      />

      {trips.length === 0 ? (
        <EmptyState
          icon={HiOutlineGlobeAlt}
          title="No trips yet"
          description="Create your first trip or join one with a code to start planning collaboratively."
          actions={
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AiOutlinePlus />}
                onClick={() => router.push('/trips/create')}
              >
                Create a Trip
              </Button>
              <Button
                variant="outlined"
                startIcon={<AiOutlineTeam />}
                onClick={() => router.push('/trips/join')}
              >
                Join a Trip
              </Button>
            </>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => router.push(`/trips/${trip.id}`)}
              className="bg-white rounded-card shadow-card p-5 text-left hover:shadow-card-hover transition-all duration-200 cursor-pointer group border border-surface-200/50"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-surface-900 group-hover:text-primary-600 transition-colors duration-200">
                  {trip.city ? `${trip.city}, ${trip.country}` : trip.country}
                </h3>
                <HiOutlineChevronRight className="w-5 h-5 text-surface-300 group-hover:text-primary-500 transition-colors duration-200 flex-shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-sm text-surface-500">
                  <HiOutlineCalendar className="w-4 h-4 text-surface-400" />
                  <span>{trip.activityCount ?? 0} {trip.activityCount === 1 ? 'activity' : 'activities'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-surface-500">
                  <AiOutlineTeam className="w-4 h-4 text-surface-400" />
                  <span>{trip.memberCount ?? 0} {trip.memberCount === 1 ? 'member' : 'members'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-surface-400">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <span className="font-mono text-xs bg-surface-100 px-1.5 py-0.5 rounded">
                  {trip.joinCode}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsPage;
