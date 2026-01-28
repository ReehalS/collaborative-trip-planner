'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@mui/material';
import Link from 'next/link';
import ProfilePicSelector from '@components/ProfilePicSelector/ProfilePicSelector';
import profileColors from '@data/profileColors';
import FormCard from '@components/FormCard/FormCard';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePic, setProfilePic] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }

      // Auto-login after successful signup
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        const { token } = await loginRes.json();
        localStorage.setItem('token', token);
        router.push('/');
      } else {
        // Signup succeeded but auto-login failed — send to login page
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during signup');
      setSubmitting(false);
    }
  };

  const SelectedIcon = profileColors[profilePic - 1]?.icon;

  return (
    <FormCard title="Create an account" subtitle="Start planning trips with friends">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        {/* Profile picture selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-surface-700">Profile Picture</p>
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

        {error && (
          <div className="bg-error-light text-error-dark rounded-btn px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-btn transition-colors duration-200"
        >
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="text-center mt-2">
          <Link
            href="/login"
            className="text-sm text-surface-500 hover:text-surface-700 transition-colors"
          >
            Already a member?{' '}
            <span className="text-primary-500 font-medium hover:underline">
              Log In
            </span>
          </Link>
        </div>
      </form>
    </FormCard>
  );
};

export default Signup;
