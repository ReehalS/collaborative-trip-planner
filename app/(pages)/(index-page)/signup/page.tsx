'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField, Button, CircularProgress } from '@mui/material';
import FormCard from '@components/FormCard/FormCard';
import ProfilePicSelector from '@components/ProfilePicSelector/ProfilePicSelector';
import profileColors from '@data/profileColors';
import { authClient } from '@app/auth-client';
import { ensureDbUser } from '@actions/ensureDbUser';
import sendApolloRequest from '@utils/sendApolloRequest';
import { USER_UPDATE_MUTATION } from '@utils/queries';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const name = `${firstName} ${lastName}`.trim();
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        setError(error.message ?? 'Sign up failed.');
        setLoading(false);
        return;
      }

      // Session is now established — create DB user and set profilePic
      const dbUser = await ensureDbUser();
      if (dbUser) {
        await sendApolloRequest(USER_UPDATE_MUTATION, {
          id: dbUser.id,
          input: { firstName, lastName, profilePic },
        });
      }

      router.push('/');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const SelectedIcon = profileColors[profilePic - 1]?.icon;

  return (
    <FormCard title="Create Account" subtitle="Join Collaborative Planner">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-error-light text-error-dark rounded-btn px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Profile pic selector */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDialog(true)}
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-150 ring-2 ring-primary-500 ring-offset-2"
            style={{
              backgroundColor:
                profileColors[profilePic - 1]?.background || '#e5e5e5',
            }}
          >
            {SelectedIcon && <SelectedIcon size={32} color="#fff" />}
          </button>
          <p className="text-xs text-surface-500">Click to choose avatar</p>
        </div>

        <ProfilePicSelector
          open={showDialog}
          selectedProfilePic={profilePic}
          onSelect={(index) => setProfilePic(index)}
          onClose={() => setShowDialog(false)}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            required
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

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          size="small"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          size="small"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Account'
          )}
        </Button>

        <p className="text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign In
          </Link>
        </p>
      </form>
    </FormCard>
  );
}
