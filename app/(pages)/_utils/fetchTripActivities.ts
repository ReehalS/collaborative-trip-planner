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
    if (activitiesResponse?.data?.activities) {
      const activities: Activity[] = activitiesResponse.data.activities;
      activities.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      return activities;
    } else {
      console.error('No activities found for the trip.');
      return [];
    }
  } catch (err) {
    console.error('Failed to fetch activities:', err);
    return [];
  }
};
