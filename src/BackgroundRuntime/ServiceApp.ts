import { MSG_TYPES } from "../constants/crossRuntimeMsgs";

import {
  handleExtensionClosedEvent,
  handleExtensionOpenedEvent,
  handleLogEvent,
  handleReactAppStateUpdateEvent,
  handleGenerateEvent,
  handleResetEvent,
} from "./extensionRunTimeMsgHandler";

import { Event } from "../types/crossRuntimeEvents";
import { AppError } from "../types/AppData";
import { ERROR_CODES } from "../constants/errors";
import { alertTab } from "../TabRuntimeAPI";
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    handleResetEvent({
      type: MSG_TYPES.RESET_EVENT,
      tabId,
    });
  }
});

const handlerWrapper = async (eventType: Event["type"], event: Event, sendResponse: (response?: any) => void) => {
  const handlers: Record<Event["type"], (event: Event, sendResponse: (res: any) => void) => Promise<void>> = {
    [MSG_TYPES.LOG_CONSOLE_MSG_EVENT]: handleLogEvent,
    [MSG_TYPES.EXTENSION_OPENED_EVENT]: handleExtensionOpenedEvent,
    [MSG_TYPES.EXTENSION_CLOSED_EVENT]: handleExtensionClosedEvent,
    [MSG_TYPES.REACT_APP_STATE_UPDATE_EVENT]: handleReactAppStateUpdateEvent,
    [MSG_TYPES.GENERATE_EVENT]: handleGenerateEvent,
    [MSG_TYPES.RESET_EVENT]: handleResetEvent,
  };
  try {
    if (handlers[eventType]) {
      await handlers[eventType](event, sendResponse);
    }
  } catch (error) {
    const typedError = error as AppError;
    console.log(error);

    if (typedError.tabId) {
      const terminalCodes = [ERROR_CODES.NO_TEXT_FOUND, ERROR_CODES.PROMPTER_FAILED, ERROR_CODES.SOMETHING_WENT_WRONG];

      if (terminalCodes.includes(typedError.code)) {
        const tabId = typedError.tabId;
        console.log(tabId);

        const tabTitle = (await chrome.tabs.get(typedError.tabId)).title;
        alertTab(
          tabId,
          `Foundra-101: It seems that something has went wrong for the ${tabTitle} Tab, Please try using the extension again.

          Note: Currently the extension does not support all webpages!`
        );
        handleResetEvent({
          type: MSG_TYPES.RESET_EVENT,
          tabId,
        });
      }
    }
  }
};

chrome.runtime.onMessage.addListener((event: Event, _, sendResponse) => {
  const eventType = event.type;
  handlerWrapper(eventType, event, sendResponse);
  return true;
});
