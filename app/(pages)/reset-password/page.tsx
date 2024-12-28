'use client';

import { useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { useRouter } from 'next/navigation';
import { RESET_PASSWORD_MUTATION } from '@utils/queries';

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
      console.log('SearchParamToken: ', searchParamToken);
      const variables = { token: searchParamToken, newPassword };
      const response = await sendApolloRequest(
        RESET_PASSWORD_MUTATION,
        variables
      );
      if (
        response?.data?.resetPassword?.message !==
        'Password reset successfully.'
      ) {
        throw new Error();
      }
      setMessage(response?.data?.resetPassword?.message);
      router.push('/login');
    } catch (err) {
      setError(
        'Failed to reset password. If you have already used the token from the email, request a new one'
      );
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Reset Password</button>
    </div>
  );
};

export default ResetPasswordPage;
