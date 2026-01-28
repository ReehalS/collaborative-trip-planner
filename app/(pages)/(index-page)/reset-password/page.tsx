'use client';

import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation';
import { RESET_PASSWORD_MUTATION } from '@utils/queries';
import { TextField, Button } from '@mui/material';
import Link from 'next/link';
import FormCard from '@components/FormCard/FormCard';

const ResetPasswordPage = ({
  searchParams,
}: {
  searchParams: { token: string };
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const searchParamToken = searchParams.token;
      const variables = { token: searchParamToken, newPassword };
      const response = await sendApolloRequest(
        RESET_PASSWORD_MUTATION,
        variables
      );
      if (
        response?.data?.resetPassword?.message !==
        'Password reset successfully.'
      ) {
        setError('Password Reset Failed');
      } else {
        setMessage(response?.data?.resetPassword?.message);
        router.push('/login');
      }
    } catch (err) {
      setError(
        'Failed to reset password. If you have already used the link from the email, request a new one'
      );
    }
  };

  return (
    <FormCard title="Set new password" subtitle="Enter your new password below">
      <div className="flex flex-col gap-4">
        <TextField
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
        />

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

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          size="large"
        >
          Reset Password
        </Button>

        <div className="text-center mt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-600 hover:underline underline-offset-2 transition-colors"
          >
            Need a new reset link? Request one here.
          </Link>
        </div>
      </div>
    </FormCard>
  );
};

export default ResetPasswordPage;
