export enum MessageType {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  SEARCH = "search",
  START_SEARCH = "start_search",
  SEARCH_RESULT = "search_result",
  MESSAGE = "message",
  ERROR = "error",
  PING = "ping",
  PONG = "pong",
}

export enum DatasourceType {
  HACKERNEWS = "hackernews",
  MEDIAWIKI = "mediawiki",
  WEB = "web",
  YOUTUBE = "youtube",
}

export type MessageReceive = {
  type: MessageType;
  payload: Record<string, any>;
};

export type MessagePayload = {
  type: MessageType;
  payload: Record<string, any>;
};

const PROJECT_NAME = "kbnet";
const KB_NAME = `${PROJECT_NAME}.kb`;
const LLM_PROVIDER = "gemini";
const LLM_MODEL = "gemini-2.0-flash";

const ML_ENGINE_NAME = `${PROJECT_NAME}.google_ml_engine`;
const HACKERNEWS_SYNC_JOB = `${PROJECT_NAME}.hackernews_sync_job`;

export const MindsDBConfig = {
  HACKERNEWS_DS: "hackernews_ds",
  MEDIAWIKI_DS: "mediawiki_ds",
  WEB_DS: "web_ds",
  YOUTUBE_DS: "youtube_ds",
  KB_NAME,
  PROJECT_NAME,
  LLM_PROVIDER,
  LLM_MODEL,
  ML_ENGINE_NAME,
  HACKERNEWS_SYNC_JOB,
  APPDB_DS: "appdb_ds",
};
