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

export const MindsDBConfig = {
  HACKERNEWS_DS: "hackernews_ds",
  MEDIAWIKI_DS: "mediawiki_ds",
  WEB_DS: "web_ds",
  YOUTUBE_DS: "youtube_ds",
  KB_NAME,
  PROJECT_NAME,
};
