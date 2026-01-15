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

  // Parse the CST string and convert to ISO format
  // Format: MM/DD/YYYY, HH:mm:ss
  const [datePart, timePart] = cstString.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");

  // Log for debugging
  console.log("🕐 CST Time Debug:", {
    originalCSTString: cstString,
    parsed: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
    readableCST: `${month}/${day}/${year} ${hour}:${minute}:${second} CST`,
  });

  // Return ISO format string with CST time (treating it as if it's UTC)
  // This ensures the exact CST time is stored in the database
  return `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(
    2,
    "0"
  )}.000Z`;
};
