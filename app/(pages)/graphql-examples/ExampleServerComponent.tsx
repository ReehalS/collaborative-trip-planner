import { gql } from 'graphql-tag';

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

export default async function ExampleServerComponent() {
  const users = await sendApolloRequest(query, variables);

  return (
    <div>
      <h1>Server Component</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
