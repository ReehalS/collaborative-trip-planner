import { DocumentNode, print } from 'graphql';

import handleApolloRequest from '@actions/handleApolloRequest';

export default async function sendApolloRequest(
  query: DocumentNode,
  variables: object,
  revalidateCache?: { path?: string; type?: 'page' | 'layout'; tag?: string }
) {
  return handleApolloRequest(print(query), variables, revalidateCache);
}
