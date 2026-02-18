'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import handler from '@datalib/apolloServer';
import { neonAuth } from '@app/auth-server';

export default async function handleApolloRequest(
  query: string,
  variables: object,
  revalidateCache?: { path?: string; type?: 'page' | 'layout'; tag?: string }
) {
  const { user } = await neonAuth();
  const userId = user?.id ?? null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (userId) {
    headers['x-internal-user-id'] = userId;
  }

  const req = new Request('http://a', {
    method: 'POST',
    headers,
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
    revalidateTag(revalidateCache.tag, 'max');
  }

  return res.json();
}
