import AI from "./AIManager";
import { updatePageText } from "../CurrentPageRuntime/DOMInterpreter";
import {
  getCurrentPageSegmentedText,
  getCurrentTab,
  updateCurrentPageText,
} from "../ExtensionRuntime/currentPageExecuter";
import { MSG_TYPES } from "../constants/crossRuntimeMsgs";

import { splitString } from "../utils/textManipulator";
import ChromeWrapper from "./ChromeWrapper";
import {
  handleExtensionClosedEvent,
  handleExtensionOpenedEvent,
  handleLogEvent,
  handleReactAppStateUpdateEvent,
} from "./extensionRunTimeMsgHandler";

import { Event } from "../types/crossRuntimeEvents";

chrome.runtime.onMessage.addListener((event: Event, _, sendResponse) => {
  const handlers: Record<Event["type"], (event: Event, sendResponse: (res: any) => void) => Promise<void>> = {
    [MSG_TYPES.LogConsoleMsgEvent]: handleLogEvent,
    [MSG_TYPES.ExtensionOpenedEvent]: handleExtensionOpenedEvent,
    [MSG_TYPES.ExtensionClosedEvent]: handleExtensionClosedEvent,
    [MSG_TYPES.ReactAppStateUpdateEvent]: handleReactAppStateUpdateEvent,
  };
  try {
    const eventType = event.type;
    if (handlers[eventType]) {
      handlers[eventType](event, sendResponse);
    }
    // const summary = await AI.getCurrentTabSummarization(message.pageText);
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
