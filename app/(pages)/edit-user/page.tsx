'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  profilePic?: number;
}

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token)
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

    try {
      const updatedUser: Partial<User> = {
        firstName,
        lastName,
        email,
        profilePic,
      };

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to update profile'}`);
        return;
      }

      const newToken = await res.text(); // Assume the server returns the updated token
      localStorage.setItem('token', newToken);

      const decoded = jwtDecode<User>(newToken);
      setUser(decoded);
      alert('Profile updated!');
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Profile Picture:</label>
        <button onClick={() => setShowDialog(true)}>
          Choose Profile Picture
        </button>
      </div>
      {showDialog && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            padding: '1rem',
          }}
        >
          <h3>Choose Profile Picture</h3>
          {profilePics.map((pic) => (
            <button key={pic} onClick={() => setProfilePic(pic)}>
              Picture {pic}
            </button>
          ))}
          <button onClick={() => setShowDialog(false)}>Close</button>
        </div>
      )}
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditUser;
