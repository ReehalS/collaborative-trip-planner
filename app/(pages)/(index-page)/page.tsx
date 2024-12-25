'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { User } from '../_types';
import profileColors from '../_data/profileColors';

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

  const getProfileColor = (profilePicIndex: number | undefined) => {
    if (profilePicIndex === undefined || profilePicIndex < 1 || profilePicIndex > 8) {
      return '#ddd'; // Default gray if no valid profilePic is set
    }
    return profileColors[(profilePicIndex - 1) % profileColors.length];
  };

  if (user) {
    const profileColor = getProfileColor(user.profilePic);

    return (
      <div style={{ padding: '1rem' }}>
        <h1>Welcome back, {user.firstName}!</h1>
        <p>Email: {user.email}</p>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: profileColor,
              border: '2px solid #ddd',
            }}
          ></div>
          <p style={{ margin: 0 }}>Your Profile Color</p>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => router.push('/trips')}>Go to Trips</button>
          <button onClick={() => router.push('/activities')}>
            Go to Activities
          </button>
          <button onClick={() => router.push('/edit-profile')}>
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  return <p>Loading...</p>;
};

export default IndexPage;
