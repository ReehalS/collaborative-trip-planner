'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import sendApolloRequest from '@utils/sendApolloRequest';
import { User } from '@utils/typeDefs';
import profileColors from '@data/profileColors';
import { USER_UPDATE_MUTATION } from '@utils/queries';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';

export default function EditUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  const SelectedIcon = profileColors[profilePic - 1]?.icon;

  return (
    <Box sx={{ p: 4 }}>
      <Button
        startIcon={<AiOutlineArrowLeft />}
        onClick={() => router.push('/')}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {!showPasswordField ? (
          <Button
            onClick={() => setShowPasswordField(true)}
            variant="outlined"
            color="primary"
          >
            Change Password
          </Button>
        ) : (
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <Box>
          <Typography>Profile Picture:</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mt: 1,
            }}
          >
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
        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>Choose Profile Picture</DialogTitle>
          <DialogContent>
            <Grid container spacing={9}>
              {profileColors.map((color, index) => {
                const Icon = color.icon;
                return (
                  <Grid item xs={1} key={index}>
                    <Button
                      fullWidth
                      onClick={() => {
                        setProfilePic(index + 1);
                        setShowDialog(false);
                      }}
                      sx={{
                        backgroundColor: color.background,
                        borderRadius: '50%',
                        maxWidth: '50px',
                        minWidth: '50px',
                        minHeight: '50px',
                        maxHeight: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: color.background,
                        },
                      }}
                    >
                      {Icon && <Icon size={24} color="#fff" />}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowDialog(false)}
              variant="contained"
              color="secondary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success"
          fullWidth
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}
