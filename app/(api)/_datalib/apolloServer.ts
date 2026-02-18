import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import typeDefs from './_typeDefs/index';
import resolvers from './_resolvers/index';

interface AppContext {
  auth: {
    userId: string | null;
  };
}

const server = new ApolloServer<AppContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});

const handler = startServerAndCreateNextHandler<Request, AppContext>(server, {
  context: async (req) => {
    const userId = req.headers.get('x-internal-user-id') || null;

    const auth = {
      userId,
    };
    return { auth };
  },
});

export default handler;
