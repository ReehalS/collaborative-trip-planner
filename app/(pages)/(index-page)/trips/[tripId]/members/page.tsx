'use client';

import { use, useEffect, useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { GET_TRIP_MEMBERS } from '@utils/queries';
import { useRouter } from 'next/navigation';
import { Alert } from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';

interface TripMember {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  role: string;
}

const TripMembersPage = ({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tripId } = use(params);
  const router = useRouter();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const variables = { tripId };
        const response = await sendApolloRequest(GET_TRIP_MEMBERS, variables);

        if (response.data.tripMembers) {
          setMembers(response.data.tripMembers);
        } else {
          setError('No members found for this trip.');
        }
      } catch (err) {
        console.error('Failed to fetch trip members:', err);
        setError('Failed to fetch trip members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [tripId, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader title="Trip Members" />

      <div className="bg-white rounded-card shadow-card border border-stone-200/60 divide-y divide-stone-100 overflow-hidden">
        {members.map((member: TripMember) => (
          <div
            key={member.user.id}
            className="flex items-center gap-3 p-4 hover:bg-primary-50/30 transition-colors duration-150"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-700">
                {member.user.firstName?.charAt(0)}
                {member.user.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-900">
                {member.user.firstName} {member.user.lastName}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                member.role === 'CREATOR'
                  ? 'bg-primary-50 text-primary-800 border border-primary-200'
                  : 'bg-stone-100 text-surface-600 border border-stone-200'
              }`}
            >
              {member.role === 'CREATOR' ? 'Creator' : 'Member'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripMembersPage;
