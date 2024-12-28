import { Activity } from '@utils/typeDefs';
import formatTimestamp from '@utils/formatTimestamp';
import castVote from '@utils/castVote';

export const addMarkers = async (
  map: google.maps.Map,
  activities: Activity[],
  timezone: string,
  reloadActivities: () => Promise<void>
): Promise<
  {
    marker: google.maps.marker.AdvancedMarkerElement;
    position: google.maps.LatLng;
  }[]
> => {
  if (!map || !activities) return [];

  const { AdvancedMarkerElement, PinElement } =
    await google.maps.importLibrary('marker');

  const markers: {
    marker: google.maps.marker.AdvancedMarkerElement;
    position: google.maps.LatLng;
  }[] = [];

  activities.forEach((activity) => {
    const position = new google.maps.LatLng(
      activity.latitude,
      activity.longitude
    );

    const pin = new PinElement({
      glyphColor: 'white',
      background: 'blue',
    });

    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: pin.element,
      title: activity.activityName,
    });

    markers.push({ marker, position }); // Save marker and its position

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h3 style="margin: 0 0 10px; font-size: 1.2rem; color: #2c3e50;">${
            activity.activityName
          }</h3>
          <p><strong>Start:</strong> ${formatTimestamp(
            activity.startTime,
            timezone
          )}</p>
          <p><strong>End:</strong> ${formatTimestamp(
            activity.endTime,
            timezone
          )}</p>
          <p><strong>Notes:</strong> ${activity.notes || 'N/A'}</p>
          <p><strong>Categories:</strong> ${activity.categories.join(', ')}</p>
          <p><strong>Average Score:</strong> ${activity.avgScore || 'N/A'}</p>
          <p><strong>Number of Voters:</strong> ${activity.numVotes || 0}</p>
          <label 
            for="rating-${activity.id}" 
            style="display: inline-flex; font-size: 16px; align-items: center; margin-right: 10px;">
            <strong style="font-weight: bold; margin-right: 5px;">Rate this activity:</strong> (out of 5)
          </label>
          <input 
            type="number" 
            id="rating-${activity.id}" 
            min="0" 
            max="5" 
            step="0.5" 
            style="width: 80px; padding: 5px; border: 1px solid #ccc; border-radius: 4px; display: inline-block;">
          <button 
            id="vote-button-${activity.id}" 
            style="display: block; margin-top: 10px; padding: 8px 12px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Vote
          </button>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);

      setTimeout(() => {
        const voteButton = document.getElementById(
          `vote-button-${activity.id}`
        );
        if (voteButton) {
          voteButton.onclick = async () => {
            await castVote(activity.id);
            await reloadActivities();
            infoWindow.close(); // Close the info window after voting
          };
        }
      }, 100);
    });
  });

  return markers; // Return marker-position pairs
};
