import ChromeWrapper from "./ChromeWrapper";
import { getCurrentTab } from "../ExtensionRuntime/currentPageExecuter";
import { generateHash } from "../utils/encoder";
import { splitString } from "../utils/textManipulator";

const prompt = async (
  prompter: AILanguageModel,
  request: string,
  data: string,
  context?: string,
  retries = 3
): Promise<string> => {
  let attempts = 0;

  const response = await prompter
    .prompt(
      `
        ${context ? "Using The following block as context" + context : ""}
        
        
        ${request}
   
        ${data}
       `
    )
    .catch((e) => {
      console.error(e);
      if (retries > attempts) {
        return prompt(prompter, request, data, context, attempts++);
      } else {
        return "";
      }
    });
  console.log(data);
  console.log(response);
  return response;
};

const getCurrentTabSummarization = async (pageText: string): Promise<string> => {
  const hash = await generateHash(pageText);
  let summary = await ChromeWrapper.getStorage(hash);
  if (summary) return summary;
  let summaries = "";
  const textBlocks = splitString(pageText, 4096);
  const prompter = await ai.languageModel.create();
  for (const textBlock of textBlocks) {
    const blockSummary = await prompt(
      prompter,
      "Summarize this entire text block into a few bullet points marinating all the important information and removing any duplicates.",
      textBlock
    );
    summaries = summaries + blockSummary;
  }
  summary = await prompt(
    prompter,
    "The following is a list of summarizes, summarize this list down removing any duplicates and formatting it as bullet points with empty lines in between.",
    summaries
  );
  await ChromeWrapper.setStorage(hash, summary);
  return summary;
};

export default { getCurrentTabSummarization, prompt };
