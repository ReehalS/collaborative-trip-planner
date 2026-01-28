'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@mui/material';
import Link from 'next/link';
import FormCard from '@components/FormCard/FormCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Something went wrong');
        return;
      }

      const { token } = await res.json();
      localStorage.setItem('token', token);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('An error occurred during login');
    }
  };

  return (
    <FormCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        {error && (
          <div className="bg-error-light text-error-dark rounded-btn px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-btn transition-colors duration-200"
        >
          Sign In
        </button>

        <div className="flex flex-col items-center gap-2 mt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-600 hover:underline underline-offset-2 transition-colors"
          >
            Forgot password?
          </Link>
          <Link
            href="/signup"
            className="text-sm text-surface-500 hover:text-surface-700 transition-colors"
          >
            Not a member yet?{' '}
            <span className="text-primary-500 font-medium hover:underline">
              Sign Up
            </span>
          </Link>
        </div>
      </form>
    </FormCard>
  );
};

export default Login;
