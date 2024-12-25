'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../_types/user'; // Import the User interface

const profilePics = Array.from({ length: 8 }, (_, i) => i + 1);

const EditUser = () => {
  const router = useRouter();

  // Retrieve and type the user from localStorage
  const [user] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(user?.profilePic || 0);
  const [showDialog, setShowDialog] = useState(false);

  const handleSave = async () => {
    if (!user) {
      alert('No user data found.');
      return;
    }

    try {
      const updatedUser: User = {
        ...user,
        firstName,
        lastName,
        email,
        profilePic,
      };

      // Make a PUT request to update the user
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

      // Update localStorage and notify user
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated!');
      router.push('/');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

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
