'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import styles from './login.module.scss';

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
    <Box className={styles.loginContainer}>
      <Box className={styles.loginBox}>
        <Typography variant="h4" component="h1" className={styles.loginTitle}>
          Login
        </Typography>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={styles.loginButton}
          >
            Login
          </Button>
          {error && (
            <Typography color="error" variant="body2" className={styles.error}>
              {error}
            </Typography>
          )}
          <Link
            href="/forgot-password"
            variant="body2"
            className={styles.forgotPassword}
          >
            Forgot password?
          </Link>
          <Link href="/signup" variant="body2" className={styles.notAMember}>
            Not a member yet? Sign Up
          </Link>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
