'use client';

import { useRouter } from 'next/navigation';

interface Suggestion {
  activityName: string;
  notes: string;
  estimatedDuration: string;
  categories: string[];
  suggestedTimeOfDay: string;
}

interface AISuggestionCardProps {
  suggestion: Suggestion;
  tripId: string;
}

const timeOfDayLabels: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  any: 'Any time',
};

export default function AISuggestionCard({
  suggestion,
  tripId,
}: AISuggestionCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-card border border-surface-200 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-surface-900 text-sm">
          {suggestion.activityName}
        </h4>
        <span className="text-xs text-surface-400 whitespace-nowrap flex-shrink-0">
          {suggestion.estimatedDuration}
        </span>
      </div>

      <p className="text-sm text-surface-600 leading-relaxed mb-3">
        {suggestion.notes}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {suggestion.categories.map((cat) => (
          <span
            key={cat}
            className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
          >
            {cat}
          </span>
        ))}
        <span className="text-xs text-surface-400">
          {timeOfDayLabels[suggestion.suggestedTimeOfDay] ||
            suggestion.suggestedTimeOfDay}
        </span>
      </div>

      <button
        onClick={() =>
          router.push(
            `/trips/${tripId}/create-activity?name=${encodeURIComponent(
              suggestion.activityName
            )}`
          )
        }
        className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        + Add to Trip
      </button>
    </div>
  );
}
