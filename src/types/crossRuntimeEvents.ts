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

type Event = ExtensionClosedEvent | ExtensionOpenedEvent | LogConsoleMsgEvent | ReactAppStateUpdateEvent;

export type { ReactAppStateUpdateEvent, ExtensionClosedEvent, ExtensionOpenedEvent, LogConsoleMsgEvent, Event };
