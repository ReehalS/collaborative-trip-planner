'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import sendApolloRequest from '@utils/sendApolloRequest';
import { User } from '@utils/typeDefs';
import { USER_UPDATE_MUTATION } from '@utils/queries';
import ProfilePicSelector from '@components/ProfilePicSelector/ProfilePicSelector';
import profileColors from '@data/profileColors';
import { Button, TextField, Alert } from '@mui/material';
import FormCard from '@components/FormCard/FormCard';
import PageHeader from '@components/PageHeader/PageHeader';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    if (!user) {
      setError('No user data found.');
      return;
    }

    if (!firstName || !email) {
      setError('Please fill in the required fields of first name and email.');
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
        setError('Failed to update profile');
        return;
      }

      const { user: updatedUser, token: newToken } = response.data.updateUser;

      localStorage.setItem('token', newToken);
      setUser(updatedUser);

      router.push('/');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('An error occurred while updating your profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="form" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-surface-500">Loading...</p>
      </div>
    );
  }

  const SelectedIcon = profileColors[profilePic - 1]?.icon;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 animate-fade-in">
      <PageHeader title="Edit Profile" onBack={() => router.push('/')} />

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="flex items-center justify-center">
        <div className="bg-white rounded-card shadow-card p-8 w-full max-w-lg">
          {/* Profile pic preview */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-card"
              style={{
                backgroundColor:
                  profileColors[profilePic - 1]?.background || '#e5e5e5',
              }}
            >
              {SelectedIcon && <SelectedIcon size={40} color="#fff" />}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
              />
            </div>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            {!showPasswordField ? (
              <button
                type="button"
                onClick={() => setShowPasswordField(true)}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium self-start hover:underline underline-offset-2 transition-colors"
              >
                Change Password
              </button>
            ) : (
              <TextField
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
            )}

            {/* Profile picture selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-surface-700">
                Profile Picture
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDialog(true)}
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-300 rounded-btn hover:bg-primary-50 transition-colors duration-200"
                >
                  Choose Avatar
                </button>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-surface-200"
                  style={{
                    backgroundColor:
                      profileColors[profilePic - 1]?.background || '#e5e5e5',
                  }}
                >
                  {SelectedIcon && <SelectedIcon size={24} color="#fff" />}
                </div>
              </div>
            </div>

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
              size="large"
              sx={{ mt: 1 }}
            >
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
