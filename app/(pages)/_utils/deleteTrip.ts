import sendApolloRequest from './sendApolloRequest';
import { DELETE_TRIP_MUTATION } from '@utils/queries';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const handleDeleteTrip = async (
  tripId: string,
  router: AppRouterInstance,
  setError: (_: string | null) => void
) => {
  try {
    const variables = { tripId };
    const response = await sendApolloRequest(DELETE_TRIP_MUTATION, variables);
    if (response.data.deleteTrip) {
      router.push('/trips');
    } else {
      setError('Failed to delete trip.');
    }
  } catch (err) {
    console.error('Failed to delete trip:', err);
    setError('Failed to delete trip.');
  }
};
