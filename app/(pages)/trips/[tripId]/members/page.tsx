'use client';

import { useEffect, useState } from 'react';
import { gql } from 'graphql-tag';
import sendApolloRequest from '@utils/sendApolloRequest';

const GET_TRIP_MEMBERS = gql`
  query GetTripMembers($tripId: ID!) {
    tripMembers(tripId: $tripId) {
      id
      user {
        id
        firstName
        lastName
      }
      role
    }
  }
`;

const TripMembersPage = ({ params }: { params: { tripId: string } }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tripId = params.tripId;

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
  }, [tripId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Members of Trip</h1>
      <ul>
        {members.map((member: any) => (
          <li key={member.user.id}>
            {member.user.firstName} {member.user.lastName} - {member.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripMembersPage;
