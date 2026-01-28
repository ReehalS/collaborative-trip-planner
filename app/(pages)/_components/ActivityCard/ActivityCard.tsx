import { Activity } from '@utils/typeDefs';
import formatTimestamp from '@utils/formatTimestamp';

interface ActivityCardProps {
  activity: Activity;
  timezone?: string;
  onClick?: () => void;
}

export default function ActivityCard({
  activity,
  timezone,
  onClick,
}: ActivityCardProps) {
  const tz = timezone || activity.timezone;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card shadow-card border border-surface-200/50 p-5 transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:shadow-card-hover hover:border-primary-200'
          : ''
      } animate-fade-in`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 text-lg mb-1">
            {activity.activityName}
          </h3>

          <div className="flex items-center gap-1.5 text-sm text-surface-500 mb-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {formatTimestamp(activity.startTime, tz)} &mdash;{' '}
              {formatTimestamp(activity.endTime, tz)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-surface-500 mb-3">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {activity.address ||
                [activity.city, activity.country].filter(Boolean).join(', ') ||
                'No location'}
            </span>
          </div>

          {activity.notes && (
            <p className="text-sm text-surface-500 line-clamp-2 mb-3">
              {activity.notes}
            </p>
          )}

          {activity.categories && activity.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activity.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {activity.avgScore > 0 && (
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">
                {activity.avgScore.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-surface-400 mt-1">
              {activity.numVotes} vote{activity.numVotes !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
