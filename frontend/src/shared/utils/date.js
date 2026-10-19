/**
 * Formats an ISO date/timestamp string into a localized readable format.
 * e.g. "2026-09-24T23:41:03.519118+01:00" -> "Sep 24, 2026 • 11:41 PM"
 */
export const formatCourseDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return `${formattedDate} • ${formattedTime}`;
  } catch {
    return String(dateString);
  }
};

/**
 * Short date format without time, e.g. "Sep 24, 2026"
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateString);
  }
};
