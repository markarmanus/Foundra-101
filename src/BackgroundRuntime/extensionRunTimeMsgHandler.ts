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
import { addCSSToTab, getTabSegmentedText, updateTabText } from "../ExtensionRuntime/TabRuntimeAPI";
import { ReactAppState } from "../types/AppData";
import { markdownToHtml } from "../utils/textManipulator";
import { editedElementsCSS } from "./CSSHelper";

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
let fakeWaitTime = 800;

const handleGenerateEvent = async (event: Event) => {
  const typedEvent = event as GenerateEvent;
  const tabId = typedEvent.tabId;
  const pageText = typedEvent.pageText;
  const wait = (time: number) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });

  /*
 ---------Step 1------- (Fake Step)
 */
  updateLoadingStepData(
    {
      label: LOADING_STEPS.GATHERING_INFO,
      progress: 50,
    },
    tabId
  );
  wait(fakeWaitTime);
  updateLoadingStepData(
    {
      label: LOADING_STEPS.GATHERING_INFO,
      progress: 100,
    },
    tabId
  );

  /*
 ---------Step 2-------
 */
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

  /*
 ---------Step 3-------
 */
  const segmentedText = await getTabSegmentedText(tabId);
  await updateLoadingStepData(
    {
      label: LOADING_STEPS.SEGMENTING,
      progress: 50,
    },
    tabId
  );
  console.log(segmentedText);
  wait(fakeWaitTime);
  await updateLoadingStepData(
    {
      label: LOADING_STEPS.SEGMENTING,
      progress: 100,
    },
    tabId
  );

  /*
 ---------Step 4-------
 */
  await updateLoadingStepData(
    {
      label: LOADING_STEPS.ALLOWING,
      progress: 50,
    },
    tabId
  );
  await addCSSToTab(tabId, editedElementsCSS);
  wait(fakeWaitTime);
  await updateLoadingStepData(
    {
      label: LOADING_STEPS.ALLOWING,
      progress: 100,
    },
    tabId
  );

  /*
 ---------Step 5-------
 */
  const rewriteElement = (elementId: string, elementTag: string, elementContent: string) => {
    console.log(`TO ${elementContent}`);
    updateTabText(tabId, [{ elementId, elementTag, elementContent: markdownToHtml(elementContent) }]);
  };
  const updateRewriteProgress = (progress: number) => {
    updateLoadingStepData(
      {
        label: LOADING_STEPS.MODIFYING,
        progress,
      },
      tabId
    );
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
