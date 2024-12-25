import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import jwt from 'jsonwebtoken';

import typeDefs from './_typeDefs/index';
import resolvers from './_resolvers/index';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
        userId = (decoded as any)?.id;
      } catch (err) {
        console.warn('Invalid token:', err.message);
      }
    }

    const auth = {
      token,
      userId,
    };
    return { auth };
  },
});

export default handler;
