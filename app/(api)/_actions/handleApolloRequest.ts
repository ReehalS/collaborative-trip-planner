'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import handler from '@datalib/apolloServer';

export default async function handleApolloRequest(
  query: string,
  variables: object,
  revalidateCache?: { path?: string; type?: 'page' | 'layout'; tag?: string }
) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // We use a dummy URL since we're not actually querying a real endpoint
  const req = new Request('http://a', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const res = await handler(req);

  if (revalidateCache?.path) {
    revalidatePath(revalidateCache.path, revalidateCache.type);
  }
  if (revalidateCache?.tag) {
    revalidateTag(revalidateCache.tag);
  }

  return res.json();
}
