'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextField, Button, CircularProgress } from '@mui/material';
import FormCard from '@components/FormCard/FormCard';
import { authClient } from '@app/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // The runtime client exposes forgetPassword as callable for email-link
      // password reset, but the TS types only model the OTP sub-method.
      type ForgetPasswordFn = (_: {
        email: string;
        redirectTo: string;
      }) => Promise<{ error?: { message?: string } }>;
      const forgetPassword =
        authClient.forgetPassword as unknown as ForgetPasswordFn;
      const { error } = await forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message ?? 'Failed to send reset email.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <FormCard
        title="Check Your Email"
        subtitle="We sent you a password reset link"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-surface-600 text-center">
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset email shortly.
          </p>
          <Link
            href="/login"
            className="text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </FormCard>
    );
  }

  return (
    <FormCard
      title="Forgot Password"
      subtitle="No worries, we'll send you a reset link"
    >
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
            'Send Reset Link'
          )}
        </Button>

        <p className="text-center text-sm">
          <Link
            href="/login"
            className="text-surface-500 hover:text-surface-700"
          >
            Back to Sign In
          </Link>
        </p>
      </form>
    </FormCard>
  );
}
