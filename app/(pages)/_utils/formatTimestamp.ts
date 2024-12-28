const formatTimestamp = (timestamp: string, timezone: string) => {
  const timestampNumeric = Number(timestamp);
  const time = timestampNumeric + Number(timezone);
  const date = new Date(time);
  return `${date.toLocaleTimeString()} on ${date.toLocaleDateString()}`;
};

export default formatTimestamp;
