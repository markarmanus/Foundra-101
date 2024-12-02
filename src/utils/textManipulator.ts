// Splits the string down to a max length using the latest newline/space available.
const splitString = (str: string, maxLength = 1024) => {
  const result = [];
  let start = 0;

  while (start < str.length) {
    let end = Math.min(start + maxLength, str.length);
    let lastNewline = str.lastIndexOf("\n", end);
    let lastSpace = str.lastIndexOf(" ", end);
    let lastTextSegment = lastIndexOfRegex(str, /\[\/\w+_id=\d+\]/g, end);

    if (lastTextSegment > start) {
      end = lastTextSegment;
    } else if (lastNewline > start) {
      end = lastNewline; // Prefer newline if it's within bounds
    } else if (lastSpace > start) {
      end = lastSpace; // Otherwise, use space
    }
    console.log(`Start is ${start} End is ${end}`);

    // If this is the last segment and it's smaller than maxLength, take the rest of the string
    if (end >= str.length || str.length - start <= maxLength) {
      result.push(str.slice(start).trim());
      break;
    }
    result.push(str.slice(start, end).trim());
    start = end; // Move past the delimiter
  }

  return result;
};

function lastIndexOfRegex(str: string, regex: RegExp, end: number) {
  const substring = str.slice(0, end + 1);
  const matches = Array.from(substring.matchAll(regex));
  // Get the last match if there are any
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    return lastMatch.index + lastMatch[0].length; // Calculate the end index of the last match
  }

  return -1; // Return -1 if no match is found
}

function markdownToHtml(markdown: string): string {
  markdown = markdown.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content}</h${level}>`;
  });

  markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");

  markdown = markdown.replace(/^-\s*(.*?)$/gm, "<ul><li>$1</li></ul>");

  markdown = markdown.replace(/^\d+\.\s*(.*?)$/gm, "<ol><li>$1</li></ol>");

  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  markdown = markdown.replace(/`(.*?)`/g, "<code>$1</code>");

  markdown = markdown.replace(/```([a-zA-Z]*)\n([\s\S]*?)\n```/g, (match, language, code) => {
    return `<pre><code class="${language}">${code}</code></pre>`;
  });

  markdown = markdown.replace(/([^<\n].*?)\n/g, "<p>$1</p>\n");

  markdown = markdown.replace(/  \n/g, "<br>\n");

  return markdown;
}

export { splitString, markdownToHtml };
