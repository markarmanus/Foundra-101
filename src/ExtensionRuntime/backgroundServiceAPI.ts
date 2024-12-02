import { MSG_TYPES } from "../constants/crossRuntimeMsgs";
import { ReactAppState } from "../types/AppData";
import { getTabText } from "./TabScripter";

const sendLogToBackground = (logMsg: any, logType: string) => {
  chrome.runtime.sendMessage({ type: MSG_TYPES.LOG_CONSOLE_MSG_EVENT, logType, logMsg: JSON.stringify(logMsg) });
};
const overRideLocalHost = () => {
  window.console.log = (msg: any) => {
    sendLogToBackground(msg, "log");
  };
  window.console.warn = (msg: any) => {
    sendLogToBackground(msg, "warn");
  };
  window.console.error = (msg: any) => {
    sendLogToBackground(msg, "error");
  };
};

const sendExtensionOpenMsg = async (appState: ReactAppState) => {
  return new Promise(async (resolve) => {
    await chrome.runtime.sendMessage(
      {
        type: MSG_TYPES.EXTENSION_OPENED_EVENT,
        appState,
      },
      (res) => {
        resolve(res);
      }
    );
  });
};

const sendGenerateMsg = async (tabId: number) => {
  const pageText = await getTabText(tabId);
  return await chrome.runtime.sendMessage({
    type: MSG_TYPES.GENERATE_EVENT,
    tabId,
    pageText,
  });
};
const sendReactAppStateUpdateEvent = async (appState: ReactAppState) => {
  return new Promise(async (resolve) => {
    await chrome.runtime.sendMessage(
      {
        type: MSG_TYPES.REACT_APP_STATE_UPDATE_EVENT,
        appState,
      },
      (res) => {
        resolve(res);
      }
    );
  });
};
const sendResetEvent = async (tabId: number) => {
  return new Promise(async (resolve) => {
    await chrome.runtime.sendMessage(
      {
        type: MSG_TYPES.RESET_EVENT,
        tabId,
      },
      (res) => {
        resolve(res);
      }
    );
  });
};
export { overRideLocalHost, sendGenerateMsg, sendExtensionOpenMsg, sendReactAppStateUpdateEvent, sendResetEvent };
