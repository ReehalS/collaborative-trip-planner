import sendApolloRequest from './sendApolloRequest';
import { CAST_VOTE_MUTATION } from './queries';

const castVote = async (activityId: string, userId: string) => {
  const ratingInput = document.getElementById(
    `rating-${activityId}`
  ) as HTMLInputElement;
  const rating = parseFloat(ratingInput.value);

  if (!rating || rating < 0 || rating > 5) {
    return;
  }

  try {
    const variables = { activityId, input: { userId, score: rating } };
    await sendApolloRequest(CAST_VOTE_MUTATION, variables);
  } catch (err) {
    console.error('Error voting activity:', err);
  }
};

export default castVote;
