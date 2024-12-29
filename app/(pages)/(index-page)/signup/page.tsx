'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import ProfilePicSelector from '@components/ProfilePicSelector/ProfilePicSelector';
import profileColors from '@data/profileColors';
import styles from './signup.module.scss';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePic, setProfilePic] = useState(0); // Default profile picture index
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          profilePic,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setError('');
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during signup');
    }
  };

  const SelectedIcon = profileColors[profilePic - 1]?.icon;

  return (
    <Box className={styles.signupContainer}>
      <Box className={styles.signupBox}>
        <Typography variant="h4" component="h1" className={styles.signupTitle}>
          Signup
        </Typography>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <TextField
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Box>
            <Typography>Profile Picture:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Button
                onClick={() => setShowDialog(true)}
                variant="contained"
                color="primary"
              >
                Choose Profile Picture
              </Button>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor:
                    profileColors[profilePic - 1]?.background || '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd',
                }}
              >
                {SelectedIcon && <SelectedIcon size={24} color="#fff" />}
              </Box>
            </Box>
          </Box>
          <ProfilePicSelector
            open={showDialog}
            selectedProfilePic={profilePic}
            onSelect={(index) => setProfilePic(index)}
            onClose={() => setShowDialog(false)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success" variant="body2">
              Signup successful! Redirecting...
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={styles.signupButton}
          >
            Signup
          </Button>
          <Link href="/login" variant="body2" className={styles.loginLink}>
            Already a member? Log In
          </Link>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;
