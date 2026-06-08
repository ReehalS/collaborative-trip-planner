'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField, Button, CircularProgress } from '@mui/material';
import FormCard from '@components/FormCard/FormCard';
import { authClient } from '@app/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(error.message ?? 'Sign in failed.');
        setLoading(false);
        return;
      }
      router.push('/');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <FormCard title="Welcome Back" subtitle="Welcome back to Wanderly">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-error-light text-error-dark rounded-btn px-4 py-2 text-sm">
            {error}
          </div>
        )}

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
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>

        <div className="text-center space-y-2 text-sm">
          <p className="text-surface-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign Up
            </Link>
          </p>
          <p>
            <Link
              href="/forgot-password"
              className="text-surface-500 hover:text-surface-700"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
      </form>
    </FormCard>
  );
}
