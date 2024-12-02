import ChromeWrapper from "./ChromeWrapper";
import { generateHash } from "../utils/encoder";
import { MSG_TYPES } from "../constants/crossRuntimeMsgs";
import { Event } from "../types/crossRuntimeEvents";
import { EXPLANATION_MODES, SUMMARIZATION_MODES } from "../constants/modes";

const deletePrompterOnReset = (prompt: AILanguageModel, tabId: number) => {
  const deleteFn = (event: Event) => {
    if (event.type === MSG_TYPES.RESET_EVENT) {
      if (tabId === event.tabId) prompt.destroy();
    }
  };
  // When User Aborts By Clicking Reset
  chrome.runtime.onMessage.addListener(deleteFn);
  // On Page Refresh
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
      deleteFn({
        tabId,
        type: MSG_TYPES.RESET_EVENT,
      });
    }
  });
};

const promptStreaming = async (
  prompter: AILanguageModel,
  request: string,
  data: string,
  context?: string,
  retries = 3
): Promise<ReadableStream<string> | undefined> => {
  let attempts = 0;
  let stream;
  try {
    stream = await prompter.promptStreaming(
      `
        ${context ? "Using The following block as context" + context : ""}
        
        
        ${request}
   
        ${data}
       `
    );
  } catch (e) {
    console.error(e);
    if (retries > attempts) {
      return promptStreaming(prompter, request, data, context, attempts++);
    } else {
      return;
    }
  }

  return stream;
};

const summarizeText = async (
  pageText: string,
  updateProgress: (progress: number) => void,
  tabId: number
): Promise<string | undefined> => {
  const hash = await generateHash(pageText);
  let summary = await ChromeWrapper.getStorage(hash);
  if (summary) {
    updateProgress(100);
    return summary;
  }

  const trimmedText = pageText.replace(/\s+/g, "");

  const prompter = await ai.languageModel.create({
    systemPrompt:
      "Your an expert on all of the internet, your job is to help summarize webpages maintain the important information and removing any thin unnecessary. TRY TO MAKE IT SUPER SHORT ",
  });
  deletePrompterOnReset(prompter, tabId);

  const summaryStream = await promptStreaming(
    prompter,
    "Summarize this entire text block into a few bullet points marinating all the important information and removing any duplicates.",
    trimmedText
  );
  const summarizationRate = 5;
  const totalTextLength = pageText.length;
  const estimatedSummarizedTextSize = totalTextLength / summarizationRate;
  if (summaryStream) {
    const reader = summaryStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        updateProgress(100);
        break;
      } else {
        const progress = Math.round((value.length / estimatedSummarizedTextSize) * 100);
        summary = value;
        updateProgress(progress);
      }
    }
  }
  if (summary) {
    await ChromeWrapper.setStorage(hash, summary);
    return summary;
  }
};

const rewriteText = async (
  pageSummary: string,
  segmentedText: string,
  generationModes: {
    summaryMode: (typeof SUMMARIZATION_MODES)[keyof typeof SUMMARIZATION_MODES];
    explanationMode: (typeof EXPLANATION_MODES)[keyof typeof EXPLANATION_MODES];
  },
  rewriteElement: (elementId: string, elementTag: string, elementNewText: string) => void,
  updateProgress: (progress: number) => void,
  tabId: number
) => {
  const explanationDetailsMap = {
    [EXPLANATION_MODES.BEGINNER]:
      "You are explaining this to a beginner on the topic, he is familiar but at a surface level",
    [EXPLANATION_MODES.NOVICE]: "You are explaning this to a complete novice, he knows nothing about this topic.",
    [EXPLANATION_MODES.EXPERIENCED]:
      "You are explaining this to someone who has decent amount of experience on the topic, only simply very complicated things ",
  };
  const summaryDetailsMap = {
    [SUMMARIZATION_MODES.AS_IS]: "Don't Modify the length of the text, Try to maintain the text at the same length",
    [SUMMARIZATION_MODES.MUCH_SHORTER]: "Try To shorten the text as much as possible.",
    [SUMMARIZATION_MODES.SHORTER]: "If possible shorten the text a bit but don't lost much of the information.",
  };

  const systemPrompt = `You are a expert on many topics, and your job is to simplify any text so that its understandable to a novice on the topic.
  Here is a list of Rules to Follow
  1. Exchange each acronym with a value that is more understandable without losing the original meaning.
  2. Don't add or remove any text except the text thats INSIDE a element block.
  3. An element block is identified through a [element] [/element] syntax, where element could be anything.
  4. Try not to repeat your self too much.
  5. If the text you are changing looks like code, don't change it and keep it as is.
  6. Do not change the meaning of a sentence or lose any information from it.
  7. DO NOT CHANGE IT IF IT LOOKS LIKE CODE
  10. If you are explaining code use the appropriate markdown to wrap you text. 

  As a Guideline 
  ${explanationDetailsMap[generationModes.explanationMode]}

  ${summaryDetailsMap[generationModes.summaryMode]}

  Your goal is to simplify complicated terms, not to rewrite the text. if its already simple leave it as it is.
  Example of modification is
  From [div_id=123] <code>Integer</code> pass an integer to generate a new number  [/div]
  To [div_id=123] pass a new number or type <code>Integer</code> for the code to generate a new number for you [/div]

  DO NOT MODIFY ANY TEXT THAT LOOKS LIKE CODING
  Here is some text relating to the topic you are an expert at, Do not output any of this text in your output this is only for context
  ${pageSummary}
  `;

  const prompter = await ai.languageModel.create({
    systemPrompt,
  });
  deletePrompterOnReset(prompter, tabId);

  const rewrittenStream = await promptStreaming(
    prompter,
    "Keeping the same structure and without getting rid of the [] update each segment to be easily more understandable for a novice on the topic.",
    segmentedText
  );
  if (rewrittenStream) {
    const reader = rewrittenStream.getReader();
    const bracketsRegex = /\[(\w+_id=(\d+))]/g;
    const matches = segmentedText.match(bracketsRegex);
    const totalElementsToRewrite = matches && matches.length;
    if (!totalElementsToRewrite) {
      alert(
        "Something Went wrong! Please Try again and the extension does not work, contact the developers! Sorry for the incontinence!"
      );
      return;
    }
    let rewrittenElements: Record<string, boolean> = {};
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        updateProgress(100);
        break;
      } else {
        const elementsToRender = /\[((\w+)_id=(\d+))]\s*([^[]+?)\s*\[\/\1\]/g;
        let match;
        while ((match = elementsToRender.exec(value)) !== null) {
          const [_, __, elementTag, elementId, content] = match;
          if (rewrittenElements[elementId]) continue;
          rewriteElement(elementId, elementTag, content);
          rewrittenElements[elementId] = true;
          const progress = Math.round((Object.keys(rewrittenElements).length / totalElementsToRewrite) * 100);
          updateProgress(progress);
        }
      }
    }
  }
};

export default { summarizeText, promptStreaming, rewriteText };
