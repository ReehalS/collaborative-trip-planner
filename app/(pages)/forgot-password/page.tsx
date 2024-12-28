'use client';

import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { FORGOT_PASSWORD_MUTATION } from '@utils/queries';
import { TextField, Button, Box, Typography } from '@mui/material';
import styles from './forgotPassword.module.scss';

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
    <Box className={styles.forgotPasswordContainer}>
      <Box className={styles.forgotPasswordBox}>
        <Typography
          variant="h4"
          component="h1"
          className={styles.forgotPasswordTitle}
        >
          Forgot Password
        </Typography>
        <TextField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={styles.resetButton}
          fullWidth
        >
          Send Reset Email
        </Button>
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
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
