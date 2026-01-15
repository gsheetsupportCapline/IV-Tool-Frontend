/**
 * Get current date and time in CST (Central Standard Time - America/Chicago) timezone
 * This function is specifically used for ivAssignedDate and ivCompletedDate fields
 * to ensure consistent timezone across all IV operations
 *
 * @returns {string} ISO string representation of current CST date/time
 */
export const getCSTDateTime = () => {
  const date = new Date();

  // Convert to CST timezone (America/Chicago includes both CST and CDT automatically)
  const cstString = date.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Parse the CST string and convert back to ISO format
  // Format: MM/DD/YYYY, HH:mm:ss
  const [datePart, timePart] = cstString.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");

  // Create date object with CST components
  const cstDate = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}`
  );

  return cstDate.toISOString();
};
