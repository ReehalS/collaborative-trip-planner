import { DocumentNode, print } from 'graphql';
import handleApolloRequest from '@actions/handleApolloRequest';

export default async function sendApolloRequest(
  query: DocumentNode,
  variables: object,
  revalidateCache?: { path?: string; type?: 'page' | 'layout'; tag?: string }
) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  //console.log(headers);
  // Pass headers to handleApolloRequest
  return handleApolloRequest(print(query), variables, revalidateCache, headers);
}
