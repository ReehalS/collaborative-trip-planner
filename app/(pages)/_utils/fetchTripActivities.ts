import sendApolloRequest from '@utils/sendApolloRequest';
import { GET_TRIP_ACTIVITIES } from '@utils/queries';
import { Activity } from '@utils/typeDefs';

export const fetchTripActivities = async (
  tripId: string
): Promise<Activity[]> => {
  try {
    const variables = { tripId };
    const activitiesResponse = await sendApolloRequest(
      GET_TRIP_ACTIVITIES,
      variables
    );
    if (activitiesResponse.data.activities) {
      return activitiesResponse.data.activities;
    } else {
      console.error('No activities found for the trip.');
      return [];
    }
  } catch (err) {
    console.error('Failed to fetch activities:', err);
    return [];
  }
};
