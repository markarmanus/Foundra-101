import { ReactAppState } from "./AppData";

interface LogConsoleMsgEvent {
  type: "LogConsoleMsgEvent";
  logType: "log" | "warn" | "error";
  logMsg: any;
}
interface ExtensionOpenedEvent {
  type: "ExtensionOpenedEvent";
  appState: ReactAppState;
}
interface ExtensionClosedEvent {
  type: "ExtensionClosedEvent";
  pageText: string;
}

interface ReactAppStateUpdateEvent {
  type: "ReactAppStateUpdateEvent";
  appState: ReactAppState;
}
interface GenerateEvent {
  type: "GenerateEvent";
  pageText: string;
  tabId: number;
}

type Event =
  | ExtensionClosedEvent
  | ExtensionOpenedEvent
  | LogConsoleMsgEvent
  | ReactAppStateUpdateEvent
  | GenerateEvent;

export type {
  ReactAppStateUpdateEvent,
  ExtensionClosedEvent,
  ExtensionOpenedEvent,
  LogConsoleMsgEvent,
  Event,
  GenerateEvent,
};
