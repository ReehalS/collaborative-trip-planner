'use client';

import { useEffect, useState } from 'react';
import sendApolloRequest from '@utils/sendApolloRequest';
import { GET_TRIP_MEMBERS } from '@utils/queries';
import { useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Button } from '@mui/material';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from './tripMembers.module.scss';

const TripMembersPage = ({ params }: { params: { tripId: string } }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tripId = params.tripId;
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }

    const fetchMembers = async () => {
      try {
        const variables = { tripId };
        const response = await sendApolloRequest(GET_TRIP_MEMBERS, variables);

        if (response.data.tripMembers) {
          setMembers(response.data.tripMembers);
        } else {
          setError('No members found for this trip.');
        }
      } catch (err) {
        console.error('Failed to fetch trip members:', err);
        setError('Failed to fetch trip members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [tripId, router]);

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Back Button */}
      <Button
        startIcon={<AiOutlineArrowLeft />}
        onClick={() => router.back()}
        className={styles.backButton}
        variant='outlined'
      >
        Back
      </Button>
      
      <Typography variant="h4" className={styles.title}>
        Members of Trip
      </Typography>
      <List className={styles.membersList}>
        {members.map((member: any) => (
          <ListItem key={member.user.id} className={styles.memberItem}>
            <ListItemText
              primary={`${member.user.firstName} ${member.user.lastName}`}
              secondary={`Role: ${member.role}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TripMembersPage;
