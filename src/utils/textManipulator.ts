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

function lastIndexOfRegex(str: string, regex: RegExp) {
  const matches = [...str.matchAll(regex)]; // Get all matches as an array
  if (matches.length === 0) {
    return -1; // No match found
  }
  return matches[matches.length - 1].index; // Return the index of the last match
}
function markdownToHtml(markdown: string) {
  // Convert headings (e.g., # Heading => <h1>Heading</h1>)
  markdown = markdown.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length; // Get the heading level (1 to 6)
    return `<h${level}>${content}</h${level}>`;
  });

  // Convert bold text (e.g., **bold** => <strong>bold</strong>)
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert italic text (e.g., *italic* => <em>italic</em>)
  markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert unordered lists (e.g., - item => <ul><li>item</li></ul>)
  markdown = markdown.replace(/^-\s*(.*?)$/gm, "<ul><li>$1</li></ul>");

  // Convert ordered lists (e.g., 1. item => <ol><li>item</li></ol>)
  markdown = markdown.replace(/^\d+\.\s*(.*?)$/gm, "<ol><li>$1</li></ol>");

  // Convert links (e.g., [text](url) => <a href="url">text</a>)
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert inline code (e.g., `code` => <code>code</code>)
  markdown = markdown.replace(/`(.*?)`/g, "<code>$1</code>");

  // Convert paragraphs (non-empty lines not matching other rules will be treated as paragraphs)
  markdown = markdown.replace(/([^<\n].*?)\n/g, "<p>$1</p>\n");

  // Handle line breaks (two spaces at the end of the line for Markdown line breaks)
  markdown = markdown.replace(/  \n/g, "<br>\n");

  return markdown;
}
export { splitString, markdownToHtml };
