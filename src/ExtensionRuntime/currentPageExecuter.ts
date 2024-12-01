import { getPageText, getPageSegmentedText, updatePageText } from "../CurrentPageRuntime/DOMInterpreter";
import { Readability } from "@mozilla/readability";
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

const getCurrentPageSegmentedText = async (): Promise<string> => {
  const tab = await getCurrentTab();
  if (tab && tab.id) {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },

      func: getPageSegmentedText,
    });
    if (result && result[0] && result[0].result) {
      const { segmentPageText } = result[0].result;
      return segmentPageText;
    }
  }
  return "";
};

const updateCurrentPageText = async (textMap: { [id: string]: string }): Promise<{ status: "Success" | "Fail" }> => {
  const tab = await getCurrentTab();
  if (tab && tab.id) {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [textMap],
      func: updatePageText,
    });
    if (result && result[0] && result[0].result) {
      return { status: "Success" };
    } else {
      return { status: "Fail" };
    }
  }
  return { status: "Fail" };
};

const getCurrentPageText = async (): Promise<string> => {
  const tab = await getCurrentTab();
  if (tab && tab.id) {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getPageText,
    });
    if (result && result[0] && result[0].result) {
      const { text } = result[0].result;

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      var article = new Readability(doc).parse();
      return article?.textContent!;
    }
  }
  return "";
};
export { getCurrentPageText, getCurrentTab, getCurrentPageSegmentedText, updateCurrentPageText };
