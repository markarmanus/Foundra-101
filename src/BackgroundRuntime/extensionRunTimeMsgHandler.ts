import ChromeWrapper from "./ChromeWrapper";
import {
  LogConsoleMsgEvent,
  ReactAppStateUpdateEvent,
  ExtensionOpenedEvent,
  Event,
  GenerateEvent,
  ResetEvent,
} from "../types/crossRuntimeEvents";
import { updateLoadingStepData } from "./extensionRunTimeAPI";
import { LOADING_STEPS } from "../constants/loadingSteps";
import AIManager from "./AIManager";
import { getTabSegmentedText, updateTabText } from "../ExtensionRuntime/TabScripter";
import { ReactAppState } from "../types/AppData";
import { markdownToHtml } from "../utils/textManipulator";

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
};

const handleExtensionClosedEvent = async (event: Event) => {};
const handleResetEvent = async (event: Event) => {
  const typedEvent = event as ResetEvent;
  const tabId = typedEvent.tabId.toFixed();
  await ChromeWrapper.deleteStorage(tabId);
};

const handleGenerateEvent = async (event: Event) => {
  const typedEvent = event as GenerateEvent;
  const tabId = typedEvent.tabId;
  updateLoadingStepData(
    {
      label: LOADING_STEPS.GATHERING_INFO,
      progress: 100,
    },
    tabId
  );

  const pageText = typedEvent.pageText;

  const updateSummaryProgress = (progress: number) => {
    updateLoadingStepData(
      {
        label: LOADING_STEPS.READING,
        progress,
      },
      tabId
    );
  };
  const summary = await AIManager.summarizeText(pageText, updateSummaryProgress, tabId);

  const segmentedText = await getTabSegmentedText(tabId);
  updateLoadingStepData(
    {
      label: LOADING_STEPS.SEGMENTING,
      progress: 100,
    },
    tabId
  );
  console.log(segmentedText);
  const updateRewriteProgress = (progress: number) => {
    updateLoadingStepData(
      {
        label: LOADING_STEPS.MODIFYING,
        progress,
      },
      tabId
    );
  };
  const rewriteElement = (elementId: string, elementTag: string, elementContent: string) => {
    console.log(`Updating: ${elementTag}_${elementId} TO: ${elementContent}`);
    updateTabText(tabId, [{ elementId, elementTag, elementContent: markdownToHtml(elementContent) }]);
  };

  const appStateJSON = await ChromeWrapper.getStorage(tabId.toFixed());
  if (appStateJSON) {
    const appState: ReactAppState = JSON.parse(appStateJSON);
    if (appState) {
      await AIManager.rewriteText(
        summary!,
        segmentedText,
        {
          summaryMode: appState.selectedSummaryMode.id,
          explanationMode: appState.selectedExplanationMode.id,
        },
        rewriteElement,
        updateRewriteProgress,
        tabId
      );
    }
  }
};

export {
  handleExtensionOpenedEvent,
  handleReactAppStateUpdateEvent,
  handleLogEvent,
  handleExtensionClosedEvent,
  handleGenerateEvent,
  handleResetEvent,
};
