import { getCurrentTab } from "../ExtensionRuntime/currentPageExecuter";
import ChromeWrapper from "./ChromeWrapper";
import { LogConsoleMsgEvent, ReactAppStateUpdateEvent, ExtensionOpenedEvent, Event } from "../types/crossRuntimeEvents";

const handleLogEvent = async (event: Event) => {
  const typedEvent = event as LogConsoleMsgEvent;
  console[typedEvent.logType]("Log from popup:", JSON.parse(typedEvent.logMsg));
};

const handleReactAppStateUpdateEvent = async (event: Event) => {
  const typedEvent = event as ReactAppStateUpdateEvent;
  const currentTab = await getCurrentTab();
  const tabId = currentTab.id;
  if (tabId) {
    await ChromeWrapper.setStorage(tabId.toFixed(), JSON.stringify(typedEvent.appState));
  }
};

const handleExtensionOpenedEvent = async (event: Event, sendResponse: (res: any) => void) => {
  const typedEvent = event as ExtensionOpenedEvent;
  const currentTab = await getCurrentTab();
  const tabId = currentTab.id;
  if (tabId) {
    const currentTabStoredData = await ChromeWrapper.getStorage(tabId.toFixed());
    if (currentTabStoredData) {
      sendResponse(currentTabStoredData);
    } else {
      const initialAppData = typedEvent.appState;

      await ChromeWrapper.setStorage(tabId.toFixed(), JSON.stringify(initialAppData));
      sendResponse(initialAppData);
    }
  }
};

const handleExtensionClosedEvent = async (event: Event) => {};

export { handleExtensionOpenedEvent, handleReactAppStateUpdateEvent, handleLogEvent, handleExtensionClosedEvent };
