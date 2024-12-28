'use client';

import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { FORGOT_PASSWORD_MUTATION } from '@utils/queries';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const variables = { email };
      const response = await sendApolloRequest(
        FORGOT_PASSWORD_MUTATION,
        variables
      );

      setMessage(response?.data?.forgotPassword?.message || 'Success');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit}>Send Reset Email</button>
    </div>
  );
};

export default ForgotPasswordPage;
