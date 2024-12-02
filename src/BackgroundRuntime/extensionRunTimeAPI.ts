import { MSG_TYPES } from "../constants/crossRuntimeMsgs";
import { LoadingStepData, ReactAppState } from "../types/AppData";
import ChromeWrapper from "./ChromeWrapper";

const updateLoadingStepData = async (loadingStep: LoadingStepData, tabId: number) => {
  const currentAppStateJSON: string | undefined = await ChromeWrapper.getStorage(tabId.toFixed());
  if (currentAppStateJSON) {
    const currentAppState: ReactAppState = JSON.parse(currentAppStateJSON);
    if (currentAppState) {
      const toReplaceIndex = currentAppState.loadingData.findIndex((step) => step.label === loadingStep.label);
      const newLoadingData = [...currentAppState.loadingData];
      newLoadingData[toReplaceIndex].progress = loadingStep.progress;
      const newAppState: ReactAppState = {
        ...currentAppState,
        loadingData: newLoadingData,
      };
      ChromeWrapper.setStorage(tabId.toFixed(), JSON.stringify(newAppState));
      chrome.runtime.sendMessage({
        type: MSG_TYPES.REACT_APP_STATE_UPDATE_EVENT,
        appState: newAppState,
      });
    }
  }
};
export { updateLoadingStepData };
