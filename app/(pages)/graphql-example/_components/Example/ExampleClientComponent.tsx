'use client';

import { gql } from 'graphql-tag';
import { useState } from 'react';

import sendApolloRequest from '@utils/sendApolloRequest';

const query = gql`
  query UserQuery($ids: [ID]!) {
    users(ids: $ids) {
      name
    }
  }
`;

// Example IDs
const variables = {
  ids: [
    '7bae85c0-7862-4d8e-b991-41c73d51936d',
    '9e327de1-38f1-4324-9427-48ec9a670ca3',
    '47ca283a-2178-4760-814f-7f847f580af3',
  ],
};

export default function ExampleClientComponent() {
  const [users, setUsers] = useState(null);

  const handleRequest = async () => {
    const res = await sendApolloRequest(query, variables);
    setUsers(res);
  };

  return (
    <div>
      <h1>Client Component</h1>
      <button onClick={handleRequest}>Button</button>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
