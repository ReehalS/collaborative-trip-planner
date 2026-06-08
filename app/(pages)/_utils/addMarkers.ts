import { Activity } from '@utils/typeDefs';
import formatTimestamp from '@utils/formatTimestamp';
import castVote from '@utils/castVote';

export const addMarkers = async (
  map: google.maps.Map,
  activities: Activity[],
  timezone: string,
  reloadActivities: () => Promise<void>,
  userId?: string
): Promise<
  {
    marker: google.maps.marker.AdvancedMarkerElement;
    infoWindow: google.maps.InfoWindow;
  }[]
> => {
  if (!map || !activities) return [];

  const { AdvancedMarkerElement, PinElement } =
    (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

  const markerInfoPairs: {
    marker: google.maps.marker.AdvancedMarkerElement;
    infoWindow: google.maps.InfoWindow;
  }[] = [];

  activities.forEach((activity) => {
    const position = new google.maps.LatLng(
      activity.latitude,
      activity.longitude
    );

    const pin = new PinElement({
      glyphColor: 'white',
      background: '#f97316',
      borderColor: '#ea580c',
    });

    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: pin.element,
      title: activity.activityName,
    });

    const categoriesHtml = activity.categories?.length
      ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px;">
          ${activity.categories
            .map(
              (cat) =>
                `<span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; background: #fff7ed; color: #9a3412;">${cat}</span>`
            )
            .join('')}
        </div>`
      : '';

    const notesHtml = activity.notes
      ? `<p style="font-size: 0.8125rem; color: #78716c; line-height: 1.5; margin: 8px 0 0;">${activity.notes}</p>`
      : '';

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family: var(--font-inter, system-ui, sans-serif); max-width: 300px; padding: 6px 2px;">
          <div style="border-left: 3px solid #f97316; padding-left: 12px; margin-bottom: 10px;">
            <h3 style="margin: 0 0 4px; font-size: 1.05rem; font-weight: 700; color: #1c1917;">
              ${activity.activityName}
            </h3>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: #57534e;">
              <span style="flex-shrink: 0;">&#128340;</span>
              <span>${formatTimestamp(
                activity.startTime,
                timezone
              )} &mdash; ${formatTimestamp(activity.endTime, timezone)}</span>
            </div>
          </div>
          ${notesHtml}
          ${categoriesHtml}
          <div style="display: flex; align-items: center; gap: 8px; padding: 10px 0 6px; border-top: 1px solid #e7e5e4; margin-top: 12px; font-size: 0.8125rem; color: #57534e;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #fff7ed; font-weight: 700; color: #f97316; font-size: 0.75rem;">${
              activity.avgScore?.toFixed(1) || '—'
            }</span>
            <span>${activity.numVotes || 0} vote${
              activity.numVotes !== 1 ? 's' : ''
            }</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
            <label for="rating-${
              activity.id
            }" style="font-size: 0.8125rem; font-weight: 600; color: #1c1917;">
              Rate (0-5):
            </label>
            <input type="number" id="rating-${activity.id}"
              min="0" max="5" step="0.5"
              style="width: 56px; padding: 5px 8px; border: 1px solid #d6d3d1; border-radius: 10px; font-size: 0.8125rem; outline: none; background: #fafaf9;"
            />
            <button id="vote-button-${activity.id}"
              style="padding: 5px 16px; background: #f97316; color: white; border: none; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: background 0.15s;"
              onmouseover="this.style.background='#ea580c'"
              onmouseout="this.style.background='#f97316'"
            >
              Vote
            </button>
          </div>
        </div>
      `,
    });

    marker.addListener('click', () => {
      // Close all other infoWindows
      markerInfoPairs.forEach(({ infoWindow: otherInfoWindow }) => {
        if (otherInfoWindow !== infoWindow) {
          otherInfoWindow.close();
        }
      });

      // Toggle this infoWindow
      if ((infoWindow as unknown as { getMap(): unknown }).getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }

      setTimeout(() => {
        const voteButton = document.getElementById(
          `vote-button-${activity.id}`
        );
        if (voteButton) {
          voteButton.onclick = async () => {
            if (userId) await castVote(activity.id, userId);
            await reloadActivities();
            infoWindow.close(); // Close after voting
          };
        }
      }, 100);
    });

    markerInfoPairs.push({ marker, infoWindow });
  });

  return markerInfoPairs;
};
