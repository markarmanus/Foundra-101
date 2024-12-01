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
}

interface LoadingStepData {
  label: string;
  progress: number;
  paletteColor: any;
}

export type { ReactAppState, LoadingStepData };
