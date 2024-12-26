'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import sendApolloRequest from '@utils/sendApolloRequest';
import { User } from '../_types';
import profileColors from '../_data/profileColors';
import { USER_UPDATE_MUTATION } from '../_utils/queries';

const profilePics = Array.from({ length: 8 }, (_, i) => i + 1);

const EditUser = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number } & User>(token);

        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired, redirecting to login.');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setUser(decoded);
        setFirstName(decoded.firstName);
        setLastName(decoded.lastName || '');
        setEmail(decoded.email);
        setProfilePic(decoded.profilePic || 0);
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleSave = async () => {
    if (!user) {
      alert('No user data found.');
      return;
    }

    if(!firstName || !email){
      alert("Please fill in the required fields of first name and email.")
    }
  
    try {
      const variables = {
        id: user.id,
        input: {
          firstName,
          lastName,
          email,
          profilePic,
          ...(showPasswordField && password ? { password } : {}),
        },
      };
  
      const response = await sendApolloRequest(USER_UPDATE_MUTATION, variables);
      console.log(response)
      if (!response?.data?.updateUser) {
        alert('Failed to update profile');
        return;
      }
      
      const { user: updatedUser, token: newToken } = response.data.updateUser;
  
      localStorage.setItem('token', newToken);
      setUser(updatedUser);
  
      router.push('/');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Edit Profile</h1>
      <div>
        <label>First Name:</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label>Last Name:</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        {!showPasswordField ? (
          <button
            onClick={() => setShowPasswordField(true)}
            style={{
              backgroundColor: '#0275d8',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Change Password
          </button>
        ) : (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </div>
      <div>
        <label>Profile Picture:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowDialog(true)}
            style={{
              backgroundColor: '#0275d8',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Choose Profile Picture
          </button>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: profileColors[(profilePic - 1) % 8], // Map profilePic to its color
              border: '1px solid #ddd',
            }}
          ></div>
        </div>
      </div>

      {showDialog && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            padding: '1rem',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
          }}
        >
          <h3>Choose Profile Picture</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {profilePics.map((pic, index) => {
              return (
                <button
                  key={pic}
                  onClick={() => setProfilePic(pic)}
                  style={{
                    backgroundColor: profileColors[index % profileColors.length],
                    color: 'white',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Picture {pic}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowDialog(false)}
            style={{
              marginTop: '10px',
              backgroundColor: '#d9534f',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditUser;
