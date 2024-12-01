import { MSG_TYPES } from "../constants/crossRuntimeMsgs";

import {
  handleExtensionClosedEvent,
  handleExtensionOpenedEvent,
  handleLogEvent,
  handleReactAppStateUpdateEvent,
  handleGenerateEvent,
} from "./extensionRunTimeMsgHandler";

import { Event } from "../types/crossRuntimeEvents";

chrome.runtime.onMessage.addListener((event: Event, _, sendResponse) => {
  const handlers: Record<Event["type"], (event: Event, sendResponse: (res: any) => void) => Promise<void>> = {
    [MSG_TYPES.LogConsoleMsgEvent]: handleLogEvent,
    [MSG_TYPES.ExtensionOpenedEvent]: handleExtensionOpenedEvent,
    [MSG_TYPES.ExtensionClosedEvent]: handleExtensionClosedEvent,
    [MSG_TYPES.ReactAppStateUpdateEvent]: handleReactAppStateUpdateEvent,
    [MSG_TYPES.GenerateEvent]: handleGenerateEvent,
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
