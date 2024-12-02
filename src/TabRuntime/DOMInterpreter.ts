import { ElementsMap } from "../types/elements";

const getPageText = (): { text: string; document: Document } => {
  return { text: document.body.outerHTML, document };
};
const updatePageText = async (elementsToUpdate: ElementsMap) => {
  elementsToUpdate.forEach(({ elementId, elementTag, elementContent }) => {
    const element = document.getElementById(elementId);

    if (element && element.tagName === elementTag.toUpperCase()) {
      if (element.textContent !== elementContent) {
        element.classList.add("highlight-text");
        element.innerHTML = elementContent;
      }
    }
  });
};

const getPageSegmentedText = (): { segmentPageText: string } => {
  function traverseDOM(element: HTMLElement) {
    let result = "";

    const elementsToSkip = ["NAV", "PRE", "STYLE", "SCRIPT", "NOSCRIPT", "HEADER", "FOOTER"];
    if (elementsToSkip.includes(element.nodeName)) return "";

    if (element.nodeType === Node.TEXT_NODE || element.nodeName === "CODE") {
      // Process the text content of the element
      return element.textContent?.trim();
    }
    // Only process visible elements (skip elements with display:none or visibility:hidden)
    if (getComputedStyle(element).display === "none" || getComputedStyle(element).visibility === "hidden") {
      return "";
    }

    // Process element nodes (e.g., div, a, p, etc.)
    if (element.nodeType === Node.ELEMENT_NODE) {
      let tag = element.tagName.toLowerCase(); // Get tag name (e.g., 'div')
      let attributes = [];

      // Collect relevant attributes for the element (e.g., id, class)
      if (!element.id) {
        element.id = (Math.random() * 10000000).toFixed();
      }
      attributes.push(`id=${element.id}`);

      // Construct the opening tag with attributes
      let openingTag = attributes.length > 0 ? `[${tag}_${attributes.join("_")}]` : `[${tag}]`;

      // Recursively traverse the children of the element
      let childrenText = "";
      for (let child of element.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE || Node.TEXT_NODE === child.nodeType)
          childrenText += traverseDOM(child as HTMLElement);
      }

      // Construct the closing tag with the same format
      let closingTag = `[/${tag}_id=${element.id}]`;

      function hasDirectText(element: HTMLElement) {
        // Iterate through the child nodes of the element
        for (const node of element.childNodes) {
          // Check if the node is a text node and has non-whitespace content
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim() !== "") {
            return true; // Direct text content found
          }
        }
        return false; // No direct text content found
      }

      // Return the formatted string with element wrapping
      const margin = getComputedStyle(element).marginBottom
        ? "\n".repeat(Math.min(parseFloat(getComputedStyle(element).marginBottom) / 8, 3))
        : "";
      if (
        !childrenText ||
        childrenText
          .replace(/\[\w+_id=.*\]/, "")
          .replace(/\[\/ \w+\]/, "")
          .trim()
          .split(" ").length < 4
      )
        return "";
      if (!hasDirectText(element)) {
        result = "\n" + `  ` + childrenText + "\n";
      } else {
        result = openingTag + "\n" + `  ` + childrenText + "\n" + closingTag + margin;
      }
    }

    return result.trim();
  }
  let bodyText = traverseDOM(document.body);
  return { segmentPageText: bodyText || "" };
};
const addCSSToPage = (cssToAdd: string) => {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = cssToAdd;
  document.head.appendChild(styleElement);
};

export { getPageText, getPageSegmentedText, updatePageText, addCSSToPage };
