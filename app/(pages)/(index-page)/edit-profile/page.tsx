'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import sendApolloRequest from '@utils/sendApolloRequest';
import { USER_UPDATE_MUTATION } from '@utils/queries';
import ProfilePicSelector from '@components/ProfilePicSelector/ProfilePicSelector';
import profileColors from '@data/profileColors';
import { Button, TextField, Alert } from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';
import LoadingSkeleton from '@components/LoadingSkeleton/LoadingSkeleton';
import { useDbUser } from '@hooks/useDbUser';
import { authClient } from '@app/auth-client';

export default function EditUser() {
  const router = useRouter();
  const { dbUser, loading: authLoading } = useDbUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePic, setProfilePic] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !dbUser) {
      router.push('/login');
      return;
    }
    if (dbUser) {
      setFirstName(dbUser.firstName || '');
      setLastName(dbUser.lastName || '');
      setProfilePic(dbUser.profilePic || 0);
    }
  }, [dbUser, authLoading, router]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!dbUser) {
      setError('No user data found.');
      return;
    }

    try {
      // Update DB fields (firstName, lastName, profilePic)
      const variables = {
        id: dbUser.id,
        input: {
          firstName,
          lastName,
          profilePic,
        },
      };

      const response = await sendApolloRequest(USER_UPDATE_MUTATION, variables);
      if (!response?.data?.updateUser) {
        setError('Failed to update profile');
        return;
      }

      // Sync display name to Neon Auth
      const name = `${firstName} ${lastName}`.trim();
      await authClient.updateUser({ name });

      // Handle password change if provided
      if (currentPassword && newPassword) {
        const { error: pwError } = await authClient.changePassword({
          currentPassword,
          newPassword,
        });
        if (pwError) {
          setError(pwError.message ?? 'Failed to change password.');
          return;
        }
        setCurrentPassword('');
        setNewPassword('');
      }

      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(
        'An error occurred while updating your profile. Please try again.'
      );
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <LoadingSkeleton variant="form" />
      </div>
    );
  }

  if (!dbUser) {
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
      {success && (
        <Alert severity="success" className="mb-4">
          {success}
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

          <div className="text-center mb-6">
            <p className="text-sm text-surface-500">{dbUser.email}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex flex-col gap-4"
          >
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                size="small"
              />
            </div>

            {/* Email (read-only) */}
            <TextField
              label="Email"
              value={dbUser.email}
              fullWidth
              size="small"
              disabled
              helperText="Email is managed by your authentication provider"
            />

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

            {/* Password change section */}
            <div className="border-t border-surface-200 pt-4 mt-2">
              <p className="text-sm font-medium text-surface-700 mb-3">
                Change Password
              </p>
              <div className="flex flex-col gap-3">
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  size="small"
                />
              </div>
            </div>

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
