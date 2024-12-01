import ChromeWrapper from "./ChromeWrapper";
import { LogConsoleMsgEvent, ReactAppStateUpdateEvent, ExtensionOpenedEvent, Event } from "../types/crossRuntimeEvents";
import { updateLoadingStepData } from "./extensionRunTimeAPI";
import { LOADING_STEPS } from "../constants/loadingSteps";

const handleLogEvent = async (event: Event) => {
  const typedEvent = event as LogConsoleMsgEvent;
  console[typedEvent.logType]("Log from popup:", JSON.parse(typedEvent.logMsg));
};

const handleReactAppStateUpdateEvent = async (event: Event) => {
  const typedEvent = event as ReactAppStateUpdateEvent;
  const tabId = typedEvent.appState.tabId;
  if (tabId) {
    await ChromeWrapper.setStorage(tabId.toFixed(), JSON.stringify(typedEvent.appState));
  }
};

const handleExtensionOpenedEvent = async (event: Event, sendResponse: (res: any) => void) => {
  const typedEvent = event as ExtensionOpenedEvent;
  const tabId = typedEvent.appState.tabId;
  if (tabId) {
    const currentTabStoredData = await ChromeWrapper.getStorage(tabId.toFixed());
    if (currentTabStoredData) {
      sendResponse(JSON.parse(currentTabStoredData));
    } else {
      const initialAppData = typedEvent.appState;

      await ChromeWrapper.setStorage(tabId.toFixed(), JSON.stringify(initialAppData));
      sendResponse(initialAppData);
    }
  }
  setInterval(async () => {
    const currentTabStoredData = await ChromeWrapper.getStorage(tabId!.toFixed());
    updateLoadingStepData(
      {
        label: LOADING_STEPS.READING,
        progress: Math.round(Math.random() * 100),
      },
      tabId!
    );
  }, 3000);
};

const handleExtensionClosedEvent = async (event: Event) => {};

export { handleExtensionOpenedEvent, handleReactAppStateUpdateEvent, handleLogEvent, handleExtensionClosedEvent };
