import { ERROR_CODES } from "../constants/errors";

interface ReactAppState {
  selectedExplanationMode: {
    id: number;
    label: string;
  };
  selectedSummaryMode: {
    id: number;
    label: string;
  };
  loadingData: LoadingStepData[];
  isGenerating: boolean;
  tabId: number | undefined;
}

interface LoadingStepData {
  label: string;
  progress: number;
  paletteColor?: any;
}

interface AppError {
  code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  tabId: number;
  message: string;
}
export type { ReactAppState, AppError, LoadingStepData };
