'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  profilePic?: number;
}

const IndexPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decodedToken = jwtDecode<{ exp: number }>(token);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.log('Token expired, clearing storage.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (err) {
        console.error('Invalid token or user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
