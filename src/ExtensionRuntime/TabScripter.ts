import { getPageText, getPageSegmentedText, updatePageText } from "../TabRuntime/DOMInterpreter";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom"; // We need jsdom to create a virtual DOM for Readability

const getTabSegmentedText = async (tabId: number): Promise<string> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: getPageSegmentedText,
  });
  if (result && result[0] && result[0].result) {
    const { segmentPageText } = result[0].result;
    return segmentPageText;
  }
  return "";
};

const updateTabText = async (
  tabId: number,
  textMap: { [id: string]: string }
): Promise<{ status: "Success" | "Fail" }> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args: [textMap],
    func: updatePageText,
  });
  if (result && result[0] && result[0].result) {
    return { status: "Success" };
  } else {
    return { status: "Fail" };
  }
};

const getTabText = async (tabId: number): Promise<string> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: getPageText,
  });
  if (result && result[0] && result[0].result) {
    const { text } = result[0].result;
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    var article = new Readability(doc).parse();
    return article?.textContent || "";
  }
  return "";
};
export { getTabText, getTabSegmentedText, updateTabText };
