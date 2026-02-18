import 'server-only';
import {
  neonAuth,
  authApiHandler,
  createAuthServer,
} from '@neondatabase/auth/next/server';

export { neonAuth, authApiHandler };

export const authServer = createAuthServer();
