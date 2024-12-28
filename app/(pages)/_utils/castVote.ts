import sendApolloRequest from './sendApolloRequest';
import { CAST_VOTE_MUTATION } from './queries';
import { User } from './typeDefs';
import { jwtDecode } from 'jwt-decode';

const castVote = async (activityId: string) => {
  const ratingInput = document.getElementById(
    `rating-${activityId}`
  ) as HTMLInputElement;
  const rating = parseFloat(ratingInput.value);

  if (!rating || rating < 0 || rating > 5) {
    alert('Please provide a valid rating between 0 and 5.');
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) return;
  const user = jwtDecode<{ exp: number } & User>(token);
  const userId = user.id;

  try {
    const variables = { activityId, input: { userId, score: rating } };
    const response = await sendApolloRequest(CAST_VOTE_MUTATION, variables);
    if (response.data.castVote) {
      alert('Thanks for voting!');
    } else {
      alert('Failed to submit your vote.');
    }
  } catch (err) {
    console.error('Error voting activity:', err);
  }
};

export default castVote;
