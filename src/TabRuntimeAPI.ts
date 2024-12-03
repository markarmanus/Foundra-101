import { getPageText, getPageSegmentedText, updatePageText, addCSSToPage } from "./TabRuntime/DOMInterpreter";
import { Readability } from "@mozilla/readability";
import { ElementsMap } from "./types/elements";

const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs[0]);
      }
    });
  });
};

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

const updateTabText = async (tabId: number, elementsMap: ElementsMap): Promise<{ status: "Success" | "Fail" }> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args: [elementsMap],
    func: updatePageText,
  });
  if (result && result[0] && result[0].result) {
    return { status: "Success" };
  } else {
    return { status: "Fail" };
  }
};

const addCSSToTab = async (tabId: number, cssToAdd: string): Promise<{ status: "Success" | "Fail" }> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args: [cssToAdd],
    func: addCSSToPage,
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

const alertTab = async (tabId: number, message: string): Promise<{ status: "Success" | "Fail" }> => {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args: [message],
    func: (message: string) => {
      alert(message);
    },
  });
  if (result && result[0] && result[0].result) {
    return { status: "Success" };
  } else {
    return { status: "Fail" };
  }
};
export { getTabText, getTabSegmentedText, updateTabText, addCSSToTab, getCurrentTab, alertTab };
