'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User } from '@utils/typeDefs';
import profileColors from '../_data/profileColors';
import { Box, Typography, Button } from '@mui/material';
import styles from './index-page.module.scss';

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

  if (user && user.profilePic) {
    const profileColor = profileColors[user.profilePic - 1]?.background || '#ccc';
    const ProfileIcon = profileColors[user.profilePic - 1]?.icon;

    return (
      <Box className={styles.container}>
        <Typography variant="h4" className={styles.welcomeMessage}>
          Welcome back, {user.firstName}!
        </Typography>
        <Typography variant="body1" className={styles.userDetails}>
          Email: {user.email}
        </Typography>
        <Box className={styles.profileSection}>
          <Box
            className={styles.profilePic}
            sx={{
              minWidth: 50,
              maxWidth: 50,
              minHeight: 50,
              maxHeight: 50,
              borderRadius: '50%',
              backgroundColor: profileColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {ProfileIcon && <ProfileIcon size={40} color="#fff" />}
          </Box>
          <Typography variant="body2" className={styles.profileText}>
            Your Profile Picture
          </Typography>
        </Box>
        <Box className={styles.actions}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/trips')}
            className={styles.actionButton}
          >
            Go to Trips
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/activities')}
            className={styles.actionButton}
          >
            Go to Activities
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/edit-profile')}
            className={styles.actionButton}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Typography variant="body1" className={styles.loading}>
      Loading...
    </Typography>
  );
};

export default IndexPage;
