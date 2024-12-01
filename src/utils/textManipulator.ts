// Splits the string down to a max length using the latest newline/space available.
const splitString = (str: string, maxLength = 1024) => {
  const result = [];
  let start = 0;

  while (start < str.length) {
    let end = Math.min(start + maxLength, str.length);
    let lastNewline = str.lastIndexOf("\n", end);
    let lastSpace = str.lastIndexOf(" ", end);
    let lastTextSegment = lastIndexOfRegex(str, /\[\/ \w+\]/g);

    if (lastTextSegment > start) {
      end = lastTextSegment;
    } else if (lastNewline > start) {
      end = lastNewline; // Prefer newline if it's within bounds
    } else if (lastSpace > start) {
      end = lastSpace; // Otherwise, use space
    }

    // If this is the last segment and it's smaller than maxLength, take the rest of the string
    if (end >= str.length || str.length - start <= maxLength) {
      result.push(str.slice(start).trim());
      break;
    }
    result.push(str.slice(start, end).trim());
    start = end + 1; // Move past the delimiter
  }

  return result;
};
export { splitString };

function lastIndexOfRegex(str: string, regex: RegExp) {
  const matches = [...str.matchAll(regex)]; // Get all matches as an array
  if (matches.length === 0) {
    return -1; // No match found
  }
  return matches[matches.length - 1].index; // Return the index of the last match
}
