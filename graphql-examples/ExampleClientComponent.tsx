'use client';

import { gql } from 'graphql-tag';
import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { jwtDecode } from 'jwt-decode';
import { User } from '@utils/typeDefs';

//  { auth }
const query = gql`
  query ActivitiesByUser($userId: String!) {
    activitiesByUser(userId: $userId) {
      id
      activityName
      notes
      city
      country
      startTime
      endTime
      latitude
      longitude
    }
  }
`;

export default function ExampleClientComponent() {
  const [activities, setActivities] = useState(null);

  const handleRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const user = jwtDecode<{ exp: number } & User>(token);

    const userId = user.id;

    const variables = {
      userId,
    };

    const res = await sendApolloRequest(query, variables);
    setActivities(res);
  };

  return (
    <div>
      <h1>Activities</h1>
      <button onClick={handleRequest}>Fetch Activities</button>
      <pre>{JSON.stringify(activities, null, 2)}</pre>
    </div>
  );
}
