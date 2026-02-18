'use server';

import { neonAuth } from '@app/auth-server';
import prisma from '@datalib/_prisma/client.js';

export async function ensureDbUser() {
  const { user } = await neonAuth();
  if (!user) return null;

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existing) return existing;

  const email = user.email ?? '';
  const displayName = user.name ?? '';
  const [firstName, ...rest] = displayName.split(' ');

  return prisma.user.create({
    data: {
      id: user.id,
      email,
      firstName: firstName || email.split('@')[0],
      lastName: rest.join(' ') || null,
      profilePic: 0,
    },
  });
}
