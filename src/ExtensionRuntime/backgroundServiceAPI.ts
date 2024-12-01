import { MSG_TYPES } from "../constants/crossRuntimeMsgs";
import { ReactAppState } from "../types/AppData";

const sendLogToBackground = (logMsg: any, logType: string) => {
  chrome.runtime.sendMessage({ type: MSG_TYPES.LogConsoleMsgEvent, logType, logMsg: JSON.stringify(logMsg) });
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
        type: MSG_TYPES.ExtensionOpenedEvent,
        appState,
      },
      (res) => {
        resolve(res);
      }
    );
  });
};
const sendReactAppStateUpdateEvent = async (appState: ReactAppState) => {
  return new Promise(async (resolve) => {
    await chrome.runtime.sendMessage(
      {
        type: MSG_TYPES.ReactAppStateUpdateEvent,
        appState,
      },
      (res) => {
        resolve(res);
      }
    );
  });
};
export { overRideLocalHost, sendExtensionOpenMsg, sendReactAppStateUpdateEvent };
