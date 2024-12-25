'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { User } from '../_types'

const IndexPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode<{ exp: number } & User>(token);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.log('Token expired, clearing storage.');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        // Extract user information directly from the token
        const { id, email, firstName, lastName, profilePic } = decodedToken;
        setUser({ id, email, firstName, lastName, profilePic });
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (user) {
    return (
      <div style={{ padding: '1rem' }}>
        <h1>Welcome back, {user.firstName}!</h1>
        <p>Email: {user.email}</p>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => router.push('/trips')}>Go to Trips</button>
          <button onClick={() => router.push('/activities')}>
            Go to Activities
          </button>
          <button onClick={() => router.push('/edit-user')}>
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  return <p>Loading...</p>;
};

export default IndexPage;
