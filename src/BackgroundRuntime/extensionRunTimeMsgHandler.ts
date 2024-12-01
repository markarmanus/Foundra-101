import ChromeWrapper from "./ChromeWrapper";
import {
  LogConsoleMsgEvent,
  ReactAppStateUpdateEvent,
  ExtensionOpenedEvent,
  Event,
  GenerateEvent,
} from "../types/crossRuntimeEvents";
import { updateLoadingStepData } from "./extensionRunTimeAPI";
import { LOADING_STEPS } from "../constants/loadingSteps";
import AIManager from "./AIManager";
import { getTabText } from "../ExtensionRuntime/TabScripter";

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

const handleGenerateEvent = async (event: Event) => {
  const typedEvent = event as GenerateEvent;

  updateLoadingStepData(
    {
      label: LOADING_STEPS.GATHERING_INFO,
      progress: 100,
    },
    typedEvent.tabId
  );

  const pageText = typedEvent.pageText;
  const summary = await AIManager.summarizeText(pageText, (progress) => {
    updateLoadingStepData(
      {
        label: LOADING_STEPS.READING,
        progress,
      },
      typedEvent.tabId
    );
  });
  console.log(summary);
  // const segmentedText = await getCurrentPageSegmentedText();
  // console.log(segmentedText);
  // const textBlocks = splitString(segmentedText.replace(" ", "").replace("\n", ""), 1024);
  // console.log(textBlocks);
  // const prompter = await ai.languageModel.create({
  //   systemPrompt: `You are a expert on many topics, and your job is to simplify any text so that its understandable to a novice on the topic.
  //     Here is a list of Rules to Follow
  //     1. Exchange each acronym with a value that is more understandable without losing the original meaning.
  //     2. Dont add or remove any text except the text thats INSIDE a element block.
  //     3. An element block is identified through a [element] [/element] syntax, where element could be anything.
  //     4. Try not to repeat your self too much.
  //     5. If the text you are changing looks like code, dont change it and keep it as is.
  //     6. Do not change the meaning of a sentence or lose any information from it.
  //     Your goal is to simplify complicated terms, not to rewrite the text. if its already simple leave it as it is.
  //     Example of modification is
  //     From [div_id=123] HDMI Cable [/div]
  //     To [div_id=123] Display Cable used to connect computer to monitor [/div]
  //     Here is some text relating to the topic you are an expert at, Do not output any of this text in your output this is only for context
  //     ${summary}
  //     `,
  // });
  // let finalString = "";
  // for (const textBlock of textBlocks) {
  //   const newString = await AI.prompt(
  //     prompter,
  //     "Keeping the same structure and without getting rid of the [] update each segment to be easily more understandable for a novice on the topic.",
  //     textBlock
  //   );
  //   finalString = finalString + newString;
  // }
  // // const newString = await AI.prompt(
  // //   prompter,
  // //   "Simplify the next block of texts making sure you dont break your rules. Only modify the sections thats withing element blocks.",
  // //   textBlocks[0],
  // //   summary
  // // );
  // // finalString = finalString + newString;
  // const regex = /\[\w+_id=(\d+)]\s*([^[]+?)\s*\[\/\s*\w+]/g;
  // const matchResults: Record<string, string> = {};
  // let match;
  // while ((match = regex.exec(finalString)) !== null) {
  //   const id = match[1]; // Captures the ID, e.g., "p_id=3477421"
  //   const text = match[2].trim(); // Captures the direct text content between tags
  //   matchResults[id] = text; // Store in an object
  // }
  // console.log(matchResults);
  // await updateCurrentPageText(matchResults);
  // const rewrittenTextMap = await AI.rewriteTextMap(textMap);
  // console.log(rewrittenTextMap);
  // await updateCurrentPageText(rewrittenTextMap);
};

export {
  handleExtensionOpenedEvent,
  handleReactAppStateUpdateEvent,
  handleLogEvent,
  handleExtensionClosedEvent,
  handleGenerateEvent,
};
