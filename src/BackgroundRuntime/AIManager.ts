import ChromeWrapper from "./ChromeWrapper";
import { getCurrentTab } from "../ExtensionRuntime/currentPageExecuter";
import { generateHash } from "../utils/encoder";
import { splitString } from "../utils/textManipulator";

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
  updateProgress: (progress: number) => void
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

export default { summarizeText, promptStreaming };
