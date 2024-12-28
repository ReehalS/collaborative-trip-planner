'use client';

import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation';
import { RESET_PASSWORD_MUTATION } from '@utils/queries';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import styles from './resetPassword.module.scss';

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
    <Box className={styles.resetPasswordContainer}>
      <Box className={styles.resetPasswordBox}>
        <Typography
          variant="h4"
          component="h1"
          className={styles.resetPasswordTitle}
        >
          Reset Password
        </Typography>

        <TextField
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        {message && (
          <Typography
            variant="body1"
            color="success"
            className={styles.message}
          >
            {message}
          </Typography>
        )}
        {error && (
          <Typography variant="body1" color="error" className={styles.error}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={styles.resetButton}
          fullWidth
        >
          Reset Password
        </Button>
        <Link
          href="/forgot-password"
          variant="body2"
          className={styles.forgotPasswordLink}
        >
          Need a new reset link? Claim one here.
        </Link>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
