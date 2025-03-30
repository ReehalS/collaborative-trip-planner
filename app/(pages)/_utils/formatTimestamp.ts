const formatTimestamp = (timestamp: string, timezone: string) => {
  let tz = timezone;
  if (tz.startsWith('--')) {
    tz = '-' + tz.slice(2);
  }
  const timestampNumeric = Number(timestamp);
  const offset = Number(tz);
  const time = timestampNumeric + offset;
  const date = new Date(time);
  return `${date.toLocaleTimeString()} on ${date.toLocaleDateString()}`;
};

export default formatTimestamp;
