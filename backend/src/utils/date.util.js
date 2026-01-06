/**
 * Convert a date string to UTC day range for timezone-safe matching
 * Input: "1990-01-15" or Date object
 * Output: { $gte: Date(1990-01-15 00:00:00.000 UTC), $lte: Date(1990-01-15 23:59:59.999 UTC) }
 * 
 * Why? Exact date equality breaks silently due to timezone offsets.
 * Example: "1990-01-15" in +5:30 timezone might be "1990-01-14" in UTC
 */
export const getUTCDayRange = (dateString) => {
  const date = new Date(dateString);
  
  // Extract UTC components (ignoring local timezone)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Start of day: 00:00:00.000 UTC
  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  
  // End of day: 23:59:59.999 UTC
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  
  return {
    $gte: startOfDay,
    $lte: endOfDay
  };
};
