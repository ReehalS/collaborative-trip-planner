/**
 * Format a timestamp for display.
 *
 * @param timestamp - ISO 8601 string (e.g. "2026-02-20T22:00:00.000Z")
 *                    or numeric ms-since-epoch as a string.
 * @param timezone  - Either an IANA timezone name (e.g. "America/Los_Angeles")
 *                    or a legacy ms-offset string (e.g. "-28800000").
 */
const formatTimestamp = (timestamp: string, timezone?: string): string => {
  // Parse the timestamp — handles both ISO strings and numeric strings
  const date = new Date(
    isNaN(Number(timestamp)) ? timestamp : Number(timestamp)
  );

  if (isNaN(date.getTime())) return 'Invalid date';

  const fmt: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };

  // If timezone looks like an IANA name (contains "/"), use Intl formatting
  if (timezone && timezone.includes('/')) {
    return date.toLocaleString(undefined, { ...fmt, timeZone: timezone });
  }

  // No timezone provided — display in user's local timezone
  if (!timezone) {
    return date.toLocaleString(undefined, fmt);
  }

  // Legacy path: timezone is a ms-offset string like "-28800000" or "--28800000"
  let offsetStr = timezone;
  if (offsetStr.startsWith('--')) {
    offsetStr = '-' + offsetStr.slice(2);
  }
  const offsetMs = Number(offsetStr) || 0;

  // Convert UTC time to the target timezone by shifting
  const utcMs = date.getTime();
  const local = new Date(utcMs + offsetMs);

  return local.toLocaleString(undefined, { ...fmt, timeZone: 'UTC' });
};

export default formatTimestamp;
