import sendApolloRequest from '@utils/sendApolloRequest';
import { GET_TRIP_DETAILS } from '@utils/queries';
import { fetchTripActivities } from '@utils/fetchTripActivities';
import { Trip, Activity } from '@utils/typeDefs';

export const fetchTripDetails = async (
  tripId: string,
  setTrip: (trip: Trip | null) => void,
  setActivities: (activities: Activity[]) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  try {
    const variables = { tripId };
    const tripResponse = await sendApolloRequest(GET_TRIP_DETAILS, variables);

    if (tripResponse.data.trip) {
      const tripData = tripResponse.data.trip;
      const activityData = await fetchTripActivities(tripId);
      setTrip(tripData);
      setActivities(activityData);
    } else {
      setError('Trip not found.');
    }
  } catch (err) {
    console.error('Failed to fetch trip details:', err);
    setError('Failed to fetch trip details.');
  }
};
