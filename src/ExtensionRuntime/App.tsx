import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ForwardRefExoticComponent, useEffect, useState } from "react";
import FoundraLogo from "/logo.png";
import "./App.css";
import { overRideLocalHost, sendExtensionOpenMsg, sendReactAppStateUpdateEvent } from "./backgroundServiceAPI";
import { Chip, Container, ContainerProps, Stack, StackProps, Typography } from "@mui/material";
import { EXPLANATION_MODES, SUMMARIZATION_MODES } from "../constants/modes";
import {
  AssistWalkerRounded,
  CheckCircle,
  DirectionsRunRounded,
  DirectionsWalkRounded,
  ShortTextRounded,
  SmartToyRounded,
  SubjectRounded,
  ViewHeadlineRounded,
} from "@mui/icons-material";

import { Line } from "rc-progress";
import { LayoutGroup, motion, useAnimation } from "motion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LoadingStepData, ReactAppState } from "../types/AppData";

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

function App() {
  const [selectedExplanationMode, SetSelectedExplanationMode] = useState(explanationModeData[EXPLANATION_MODES.NOVICE]);
  const [selectedSummaryMode, setSelectedSummaryMode] = useState(summarizationModeData[SUMMARIZATION_MODES.AS_IS]);
  const [loadingData, setLoadingData] = useState<LoadingStepData[]>([
    { paletteColor: theme.palette.secondary, progress: 20, label: "Reading The Page" },
    { paletteColor: theme.palette.secondary, progress: 20, label: "Reading The Page" },
  ]);
  const controls = useAnimation();
  const [loading, setLoading] = useState(false);

  const applyAppState = (appState: ReactAppState) => {
    SetSelectedExplanationMode(explanationModeData[appState.selectedExplanationMode.id]);
    setSelectedSummaryMode(summarizationModeData[appState.selectedSummaryMode.id]);
    setLoadingData(appState.loadingData);
  };

  const getInitialAppData = async () => {
    const appState: ReactAppState = {
      selectedExplanationMode,
      selectedSummaryMode,
      loadingData,
    };
    const data = await sendExtensionOpenMsg(appState);
    applyAppState(data as ReactAppState);
  };

  useEffect(() => {
    overRideLocalHost();
    getInitialAppData();
  }, []);

  useEffect(() => {
    const appState: ReactAppState = {
      selectedExplanationMode,
      selectedSummaryMode,
      loadingData,
    };
    sendReactAppStateUpdateEvent(appState);
  }, [selectedSummaryMode, selectedExplanationMode]);

  const changeExplanationMode = (modeId: number) => {
    SetSelectedExplanationMode(explanationModeData[modeId]);
  };
  const changeSummaryMode = (modeId: number) => {
    setSelectedSummaryMode(summarizationModeData[modeId]);
  };
  const generate = () => {
    setLoading(!loading);

    setLoadingData([
      { paletteColor: theme.palette.secondary, progress: 60, label: "Gathering Info" },
      { paletteColor: theme.palette.secondary, progress: 100, label: "Segmenting The Text" },
      { paletteColor: theme.palette.secondary, progress: 100, label: "Reading Text Segments" },
      { paletteColor: theme.palette.secondary, progress: 100, label: "Analyzing The Page Structure" },
      { paletteColor: theme.palette.secondary, progress: 100, label: "Modifying The Page" },
    ]);
  };

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
    if (loading) {
      document.getElementById("logo")?.classList.add("rotating");
      controls.start("rotating");
    } else {
      document.getElementById("logo")?.classList.remove("rotating");
      controls.start("paused");
    }
  }, [loading]);
  const MotionStack = motion.create(Stack as ForwardRefExoticComponent<StackProps>);
  const MotionContainer = motion.create(Container as ForwardRefExoticComponent<ContainerProps>);

  const middleContainerMinHeight = "260px";
  const middleContainerMinWidth = "470px";
  const animationProps = {
    initial: { height: "0px", minHeight: "0px" },
    animate: { height: middleContainerMinHeight, minHeight: middleContainerMinHeight },
    exit: { height: middleContainerMinHeight, minHeight: middleContainerMinHeight },
    transition: { layout: { duration: 0.5 } },
    sx: { minHeight: middleContainerMinHeight, overflow: "hidden" },
    layout: true,
  };

  const LogoVariants = {
    rotating: {
      rotate: [0, 360],
      filter: ["drop-shadow(0 0 2em #646cffaa)", "drop-shadow(0 0 3em #646cff55)", "drop-shadow(0 0 2em #646cffaa)"],
      transition: {
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: [0.25, 1, 0.5, 1],
        },
        filter: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
    paused: {
      rotate: 360,
      filter: "drop-shadow(0 0 2em #646cffaa)",
      transition: {
        duration: 0.5,
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
            variants={LogoVariants}
            whileHover={{
              filter: "drop-shadow(0 0 2em #646cffaa)",
            }}
          />
        </Container>
        <Container sx={{ minHeight: middleContainerMinHeight, minWidth: middleContainerMinWidth, margin: "20px 0px" }}>
          <LayoutGroup>
            {loading && (
              <MotionStack {...animationProps} justifyContent={"space-around"}>
                {getLoadingStepComponents()}
              </MotionStack>
            )}
            {!loading && (
              <MotionContainer {...animationProps}>
                {getExplanationModeComponents()}
                {getSummaryModeComponents()}
              </MotionContainer>
            )}
          </LayoutGroup>
        </Container>
        <Container>
          <Chip
            size="medium"
            onClick={generate}
            label={loading ? "Reset" : "Generate"}
            color={loading ? "warning" : "secondary"}
            icon={<SmartToyRounded />}
          />
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
