import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '../../_datalib/_prisma/client.js'; // Ensure your Prisma client is correctly imported

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'example@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please provide both email and password');
          }

          // Fetch user from the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error('Invalid credentials');
          }

          // Return user object for JWT
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePic: user.profilePic,
          };
        } catch (error) {
          console.error('Authorize error:', error.message);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JWT-based sessions
  },
  callbacks: {
    async session({ session, token }) {
      // Attach token data to session
      session.user = {
        id: token.id,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        profilePic: token.profilePic,
      };
      return session;
    },
    async jwt({ token, user }) {
      // Populate token with user data
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profilePic = user.profilePic;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in your .env file
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    error: '/auth/error', // Custom error page
  },
});
