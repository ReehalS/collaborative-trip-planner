'use client';

import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { FORGOT_PASSWORD_MUTATION } from '@utils/queries';
import { TextField, Button } from '@mui/material';
import Link from 'next/link';
import FormCard from '@components/FormCard/FormCard';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      setMessage(null);
      const variables = { email };
      const response = await sendApolloRequest(
        FORGOT_PASSWORD_MUTATION,
        variables
      );
      if (response?.errors[0].message) {
        setError(response?.errors[0].message);
      } else {
        setMessage(response?.data?.forgotPassword?.message);
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <FormCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          size="large"
        >
          Send Reset Email
        </Button>

        {message && (
          <div className="bg-success-light text-success-dark rounded-btn px-4 py-2 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-error-light text-error-dark rounded-btn px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mt-2">
          <Link
            href="/login"
            className="text-sm text-primary-500 hover:text-primary-600 hover:underline underline-offset-2 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </FormCard>
  );
};

export default ForgotPasswordPage;
