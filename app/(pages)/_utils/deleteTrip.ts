import sendApolloRequest from './sendApolloRequest';
import { DELETE_TRIP_MUTATION } from '@utils/queries';

export const handleDeleteTrip = async (
  tripId: string,
  router: any,
  setError: (error: string | null) => void
) => {
  try {
    const variables = { tripId };
    const response = await sendApolloRequest(DELETE_TRIP_MUTATION, variables);
    if (response.data.deleteTrip) {
      alert('Trip deleted successfully!');
      router.push('/trips');
    } else {
      setError('Failed to delete trip.');
    }
  } catch (err) {
    console.error('Failed to delete trip:', err);
    setError('Failed to delete trip.');
  }
};
