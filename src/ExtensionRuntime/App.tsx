import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { useEffect, useState } from "react";
import FoundraLogo from "/logo.png";
import "./App.css";
import {
  overRideLocalHost,
  sendExtensionOpenMsg,
  sendGenerateMsg,
  sendReactAppStateUpdateEvent,
  sendResetEvent,
} from "./backgroundServiceAPI";
import { Chip, Container, Stack, Typography } from "@mui/material";
import { EXPLANATION_MODES, SUMMARIZATION_MODES } from "../constants/modes";
import {
  AssistWalkerRounded,
  CheckCircle,
  DeleteForeverRounded,
  DirectionsRunRounded,
  DirectionsWalkRounded,
  ShortTextRounded,
  SmartToyRounded,
  SubjectRounded,
  ViewHeadlineRounded,
} from "@mui/icons-material";

import { Line } from "rc-progress";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LoadingStepData, ReactAppState } from "../types/AppData";
import { Event } from "../types/crossRuntimeEvents";
import { MSG_TYPES } from "../constants/crossRuntimeMsgs";
import { LOADING_STEPS } from "../constants/loadingSteps";
import { getCurrentTab } from "./TabRuntimeAPI";

const theme = createTheme({
  palette: {
    primary: {
      light: "#4587bb",
      main: "#1769aa",
      dark: "#104976",
      contrastText: "#fff",
    },
    secondary: {
      light: "#9778ce",
      main: "#646cffaa",
      dark: "#583c87",
      contrastText: "#fff",
    },
  },
});
const explanationModeData = {
  [EXPLANATION_MODES.NOVICE]: {
    id: EXPLANATION_MODES.NOVICE,
    label: "Novice",
    icon: <AssistWalkerRounded />,
  },
  [EXPLANATION_MODES.BEGINNER]: {
    id: EXPLANATION_MODES.BEGINNER,
    label: "Beginner",
    icon: <DirectionsWalkRounded />,
  },
  [EXPLANATION_MODES.EXPERIENCED]: {
    id: EXPLANATION_MODES.EXPERIENCED,
    label: "Experienced",
    icon: <DirectionsRunRounded />,
  },
};

const summarizationModeData = {
  [SUMMARIZATION_MODES.AS_IS]: {
    id: SUMMARIZATION_MODES.AS_IS,
    label: "Same Length",
    icon: <ViewHeadlineRounded />,
  },
  [SUMMARIZATION_MODES.SHORTER]: {
    id: SUMMARIZATION_MODES.SHORTER,
    label: "Shorter",
    icon: <SubjectRounded />,
  },
  [SUMMARIZATION_MODES.MUCH_SHORTER]: {
    id: SUMMARIZATION_MODES.MUCH_SHORTER,
    label: "Much Shorter",
    icon: <ShortTextRounded />,
  },
};

const initialLoadingData = Object.values(LOADING_STEPS).map((label) => {
  return { paletteColor: theme.palette.secondary, progress: 0, label };
});

function App() {
  const [selectedExplanationMode, SetSelectedExplanationMode] = useState(explanationModeData[EXPLANATION_MODES.NOVICE]);
  const [selectedSummaryMode, setSelectedSummaryMode] = useState(summarizationModeData[SUMMARIZATION_MODES.AS_IS]);
  const [readyToRender, setReadyToRender] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tabId, setTabId] = useState<number | undefined>();
  const [loadingData, setLoadingData] = useState<LoadingStepData[]>(initialLoadingData);
  const controls = useAnimation();
  const [loading, setLoading] = useState(false);

  const checkIfDone = () => {
    if (loadingData.every((step) => step.progress === 100)) {
      setIsDone(true);
    }
  };
  //Step 1: Get Tha Tab Id and Store it
  const initializeExtension = async () => {
    overRideLocalHost();
    const tabId = (await getCurrentTab()).id;
    setTabId(tabId);
  };

  useEffect(() => {
    initializeExtension();
  }, []);

  // Step 2: Get Stored App Data If it Exists
  useEffect(() => {
    if (tabId) {
      setTabId(tabId);
      getInitialAppData(tabId);
      listenToStateUpdates();
      checkIfDone();
    }
  }, [tabId]);

  const getInitialAppData = async (tabId: number) => {
    const appState: ReactAppState = {
      selectedExplanationMode,
      selectedSummaryMode,
      loadingData,
      isGenerating: false,
      tabId,
    };
    const data = await sendExtensionOpenMsg(appState);
    applyAppState(data as ReactAppState);
    setReadyToRender(true);
    controls.start("fadeIn");
  };

  // Step 3: Apply State updates When update comes from Service App
  const listenToStateUpdates = () => {
    chrome.runtime.onMessage.addListener((event: Event, sender) => {
      if (event.type === MSG_TYPES.REACT_APP_STATE_UPDATE_EVENT) {
        applyAppState(event.appState);
      }
    });
  };

  // Step 4: Send State Updates to Service App To Store when User Interacts
  useEffect(() => {
    const appState: ReactAppState = {
      selectedExplanationMode,
      isGenerating: loading,
      selectedSummaryMode,
      tabId,
      loadingData,
    };
    sendReactAppStateUpdateEvent(appState);
  }, [selectedSummaryMode, selectedExplanationMode, loading]);

  useEffect(() => {
    checkIfDone();
  }, [loadingData]);

  useEffect(() => {
    if (isDone) {
      controls.start("paused");
    }
  }, [isDone]);
  const applyAppState = (appState: ReactAppState) => {
    if (appState.tabId === tabId) {
      SetSelectedExplanationMode(explanationModeData[appState.selectedExplanationMode.id]);
      setSelectedSummaryMode(summarizationModeData[appState.selectedSummaryMode.id]);
      setLoadingData(appState.loadingData);
      setLoading(appState.isGenerating);
    }
  };

  const changeExplanationMode = (modeId: number) => {
    SetSelectedExplanationMode(explanationModeData[modeId]);
  };

  const changeSummaryMode = (modeId: number) => {
    setSelectedSummaryMode(summarizationModeData[modeId]);
  };

  const generate = () => {
    setLoading(true);
    sendGenerateMsg(tabId!);
  };

  const reset = () => {
    setLoadingData(initialLoadingData);
    setLoading(false);
    setIsDone(false);
    sendReactAppStateUpdateEvent({
      loadingData: initialLoadingData,
      isGenerating: false,
      selectedExplanationMode,
      selectedSummaryMode,
      tabId,
    });
    sendResetEvent(tabId!);
  };

  // Render Logic
  const getLoadingStepComponents = () => {
    return loadingData.map((loadingStepData) => {
      const { paletteColor, label, progress } = loadingStepData;
      const { dark, light, main } = paletteColor;
      const color = progress > 66.6 ? dark : progress > 33.3 ? main : light;
      return (
        <Stack className="loadingLine" direction="row" justifyContent={"center"} alignItems={"center"} spacing={0}>
          <Typography flex={3} noWrap>
            {label}
          </Typography>
          <Container sx={{ m: 0, flex: 3 }}>
            <Line percent={progress} strokeWidth={6} trailWidth={6} strokeColor={color} />
          </Container>

          <motion.span initial={{ opacity: 0 }} animate={{ opacity: progress === 100 ? 1 : 0 }}>
            <CheckCircle sx={{ flex: 1 }} color={"success"} />
          </motion.span>
        </Stack>
      );
    });
  };

  const getExplanationModeComponents = () => {
    const chipComponents = Object.values(explanationModeData).map((mode) => {
      const selected = selectedExplanationMode.id === mode.id;
      return (
        <Chip
          icon={mode.icon}
          onClick={() => {
            changeExplanationMode(mode.id);
          }}
          label={mode.label}
          variant={selected ? "filled" : "outlined"}
          color={selected ? "primary" : "default"}
        />
      );
    });
    return (
      <Container className="segment">
        <h3>So, What is the level of understanding and knowledge you have on this topic.</h3>
        <Stack justify-content="center" direction="row" spacing={2}>
          {chipComponents}
        </Stack>
      </Container>
    );
  };

  const getSummaryModeComponents = () => {
    const chipComponents = Object.values(summarizationModeData).map((mode) => {
      const selected = selectedSummaryMode.id === mode.id;
      return (
        <Chip
          icon={mode.icon}
          onClick={() => {
            changeSummaryMode(mode.id);
          }}
          label={mode.label}
          variant={selected ? "filled" : "outlined"}
          color={selected ? "primary" : "default"}
        />
      );
    });
    return (
      <Container className="segment">
        <h3>I can also shorten the text if its too much to read!</h3>
        <Stack justify-content="center" direction="row" spacing={2}>
          {chipComponents}
        </Stack>
      </Container>
    );
  };

  useEffect(() => {
    if (loading && !isDone) {
      document.getElementById("logo")?.classList.add("rotating");
      controls.start("rotating");
    } else {
      document.getElementById("logo")?.classList.remove("rotating");
      controls.start("paused", { delay: 0.2, duration: 1 });
    }
  }, [loading]);

  const middleContainerMinHeight = "260px";
  const middleContainerMinWidth = "470px";

  const logoAnimationVariants = {
    rotating: {
      rotate: [0, 360],
      filter: ["drop-shadow(0 0 2em #646cffaa)", "drop-shadow(0 0 3em #646cff55)", "drop-shadow(0 0 2em #646cffaa)"],
      transition: {
        rotate: {
          duration: 3,
          repeat: Infinity,
          ease: [0.25, 1, 0.5, 1],
        },
        filter: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
    paused: {
      rotate: 360,
      filter: ["drop-shadow(0 0 2em #646cffaa)", "drop-shadow(0 0 0em #646cffaa)"],
      transition: {
        duration: 1,
      },
    },
    fadeIn: {
      opacity: [0, 1],
      transition: {
        duration: 1,
      },
    },
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container>
          <h1>Foundra-101</h1>
          <h3>Your AI assistant to understanding the web!</h3>

          <motion.img
            src={FoundraLogo}
            id="logo"
            alt="Foundra Logo"
            animate={controls}
            variants={logoAnimationVariants}
            initial={{ filter: "drop-shadow(0 0 0em #646cffaa)" }}
            whileHover={{
              filter: "drop-shadow(0 0 2em #646cffaa)",
              scale: 1.01,
            }}
          />
        </Container>
        {readyToRender && (
          <>
            <Container
              sx={{ minHeight: middleContainerMinHeight, minWidth: middleContainerMinWidth, margin: "20px 0px" }}
            >
              <AnimatePresence mode="wait">
                {loading && (
                  <Stack
                    sx={{ minHeight: middleContainerMinHeight, overflow: "hidden" }}
                    justifyContent={"space-around"}
                  >
                    {getLoadingStepComponents()}
                  </Stack>
                )}
                {isDone && (
                  <Typography>
                    Any Text highted in Purple has been simplified for you convince! Thanks for using our product!
                  </Typography>
                )}
                {!loading && (
                  <Container sx={{ minHeight: middleContainerMinHeight, overflow: "hidden" }}>
                    {getExplanationModeComponents()}
                    {getSummaryModeComponents()}
                  </Container>
                )}
              </AnimatePresence>
            </Container>
            <Container>
              <Chip
                size="medium"
                onClick={loading ? reset : generate}
                label={loading ? "Reset" : "Generate"}
                color={loading ? "warning" : "secondary"}
                icon={loading ? <DeleteForeverRounded /> : <SmartToyRounded />}
              />
            </Container>
          </>
        )}
      </ThemeProvider>
    </>
  );
}

export default App;
