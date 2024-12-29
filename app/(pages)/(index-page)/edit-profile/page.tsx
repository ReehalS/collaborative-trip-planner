'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import sendApolloRequest from '@utils/sendApolloRequest';
import { User } from '@utils/typeDefs';
import { USER_UPDATE_MUTATION } from '@utils/queries';
import ProfilePicSelector from '@components/ProfilePicSelector/ProfilePicSelector';
import profileColors from '@data/profileColors';
import { IconType } from 'react-icons';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from './editProfile.module.scss';

export default function EditUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(0);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number } & User>(token);

        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired, redirecting to login.');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setUser(decoded);
        setFirstName(decoded.firstName);
        setLastName(decoded.lastName || '');
        setEmail(decoded.email);
        setProfilePic(decoded.profilePic || 0);
        setLoading(false);
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleSave = async () => {
    if (!user) {
      alert('No user data found.');
      return;
    }

    if (!firstName || !email) {
      alert('Please fill in the required fields of first name and email.');
      return;
    }

    try {
      const variables = {
        id: user.id,
        input: {
          firstName,
          lastName,
          email,
          profilePic,
          ...(showPasswordField && password ? { password } : {}),
        },
      };

      const response = await sendApolloRequest(USER_UPDATE_MUTATION, variables);
      if (!response?.data?.updateUser) {
        alert('Failed to update profile');
        return;
      }

      const { user: updatedUser, token: newToken } = response.data.updateUser;

      localStorage.setItem('token', newToken);
      setUser(updatedUser);

      router.push('/');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box className={styles.container}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  const SelectedIcon = profileColors[profilePic - 1]?.icon;

  return (
    <Box>
      <Box>
        <Button
          startIcon={<AiOutlineArrowLeft />}
          onClick={() => router.push('/')}
          variant="outlined"
          className={styles.backButton}
        >
          Back
        </Button>
        <Box className={styles.editContainer}>
          <Box className={styles.editBox}>
            <Typography variant="h4" component="h1" className={styles.editTitle}>
              Edit Profile
            </Typography>
            <form onSubmit={handleSave} className={styles.editForm}>
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
              {!showPasswordField ? (
                <Button
                  onClick={() => setShowPasswordField(true)}
                  variant="outlined"
                  color="primary"
                  className={styles.changePasswordButton}
                >
                  Change Password
                </Button>
              ) : (
                <TextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}
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
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                className={styles.saveButton}
              >
                Save Changes
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
