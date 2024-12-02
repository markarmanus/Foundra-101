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
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    handleResetEvent({
      type: MSG_TYPES.RESET_EVENT,
      tabId,
    });
  }
});
chrome.runtime.onMessage.addListener((event: Event, _, sendResponse) => {
  const handlers: Record<Event["type"], (event: Event, sendResponse: (res: any) => void) => Promise<void>> = {
    [MSG_TYPES.LOG_CONSOLE_MSG_EVENT]: handleLogEvent,
    [MSG_TYPES.EXTENSION_OPENED_EVENT]: handleExtensionOpenedEvent,
    [MSG_TYPES.EXTENSION_CLOSED_EVENT]: handleExtensionClosedEvent,
    [MSG_TYPES.REACT_APP_STATE_UPDATE_EVENT]: handleReactAppStateUpdateEvent,
    [MSG_TYPES.GENERATE_EVENT]: handleGenerateEvent,
    [MSG_TYPES.RESET_EVENT]: handleResetEvent,
  };
  try {
    const eventType = event.type;
    if (handlers[eventType]) {
      handlers[eventType](event, sendResponse);
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      const errorData = {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
      console.error(errorData);
    }
  }
});
