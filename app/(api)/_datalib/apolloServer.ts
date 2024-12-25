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
    //console.log('in Context: ', req); // Debugging the context function

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    //console.log(authHeader);

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
        userId = (decoded as any)?.id; // Ensure `userId` exists in the JWT payload
      } catch (err) {
        console.warn('Invalid token:', err.message);
      }
    }

    const auth = {
      token,
      userId,
    };

    //console.log('Auth in context:', auth); // Debug logging for context

    return { auth }; // Pass `auth` to resolvers
  },
});

export default handler;
