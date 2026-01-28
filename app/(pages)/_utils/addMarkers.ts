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
    infoWindow: google.maps.InfoWindow;
  }[]
> => {
  if (!map || !activities) return [];

  const { AdvancedMarkerElement, PinElement } =
    await google.maps.importLibrary('marker');

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
      background: '#3b82f6',
    });

    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: pin.element,
      title: activity.activityName,
    });

    const categoriesHtml = activity.categories?.length
      ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
          ${activity.categories
            .map(
              (cat) =>
                `<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 500; background: #eff6ff; color: #1d4ed8;">${cat}</span>`
            )
            .join('')}
        </div>`
      : '';

    const notesHtml = activity.notes
      ? `<p style="font-size: 0.8125rem; color: #737373; line-height: 1.5; margin: 6px 0 0;">${activity.notes}</p>`
      : '';

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family: var(--font-inter, system-ui, sans-serif); max-width: 280px; padding: 4px;">
          <h3 style="margin: 0 0 6px; font-size: 1rem; font-weight: 600; color: #171717;">
            ${activity.activityName}
          </h3>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: #525252;">
            <span style="flex-shrink: 0;">&#128340;</span>
            <span>${formatTimestamp(activity.startTime, timezone)} &mdash; ${formatTimestamp(activity.endTime, timezone)}</span>
          </div>
          ${notesHtml}
          ${categoriesHtml}
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-top: 1px solid #e5e5e5; margin-top: 10px; font-size: 0.8125rem; color: #525252;">
            <span style="font-weight: 600;">Score:</span> ${activity.avgScore?.toFixed(1) || 'N/A'}
            <span style="color: #a3a3a3;">&middot;</span>
            <span>${activity.numVotes || 0} vote${activity.numVotes !== 1 ? 's' : ''}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
            <label for="rating-${activity.id}" style="font-size: 0.8125rem; font-weight: 600; color: #171717;">
              Rate (0-5):
            </label>
            <input type="number" id="rating-${activity.id}"
              min="0" max="5" step="0.5"
              style="width: 56px; padding: 4px 8px; border: 1px solid #d4d4d4; border-radius: 8px; font-size: 0.8125rem; outline: none;"
            />
            <button id="vote-button-${activity.id}"
              style="padding: 4px 14px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;"
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
      if (infoWindow.getMap()) {
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
            await castVote(activity.id);
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
