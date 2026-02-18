'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@app/auth-client';
import { ensureDbUser } from '@actions/ensureDbUser';
import { User } from '@utils/typeDefs';

export function useDbUser() {
  const session = authClient.useSession();
  const authUser = session.data?.user ?? null;
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      ensureDbUser()
        .then((user) => {
          setDbUser(user as User | null);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else if (!session.isPending) {
      setDbUser(null);
      setLoading(false);
    }
  }, [authUser, session.isPending]);

  return {
    dbUser,
    loading,
    isAuthenticated: !!authUser,
  };
}
