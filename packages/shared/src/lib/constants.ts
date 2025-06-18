export enum MessageType {
  START_SEARCH = "start_search",
  SEARCH_RESULT = "search_result",
  ERROR = "error",
  PING = "ping",
  PONG = "pong",

  // map
  MAP_CREATED = "map_created",
  RESUME_MAP = "resume_map",
  MAP_DATA = "map_data",
  MAP_BRANCHES = "map_branches",
  GET_MAP_BRANCHES = "get_map_branches",

  // navigation
  NAVIGATE = "navigate",
  NAVIGATE_BACK = "navigate_back",

  // user stat
  GET_USER_STAT = "get_user_stat",
  USER_STAT = "user_stat",
  SHOW_NOTIFICATION = "SHOW_NOTIFICATION",
}

export enum DatasourceType {
  HACKERNEWS = "hackernews",
  MEDIAWIKI = "mediawiki",
  WEB = "web",
  YOUTUBE = "youtube",
  ARXIV = "arxiv",
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

const ML_ENGINE_NAME = `google_ml_engine`;
const HACKERNEWS_SYNC_JOB = `${PROJECT_NAME}.hackernews_sync_job`;
const APPDB_DS = "appdb_ds";
const KMAP_TB = `${APPDB_DS}.public.k_maps`;
const KMAP_NODE_TB = `${APPDB_DS}.public.k_map_nodes`;
const KMAP_EDGE_TB = `${APPDB_DS}.public.k_map_edges`;
const KMAP_TIMELINE_TB = `${APPDB_DS}.public.k_map_timeline`;
const KMAP_NODE_TRIGGER = `gen_main_node_trigger`;

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
  APPDB_DS,
  KMAP_TB,
  KMAP_NODE_TB,
  KMAP_EDGE_TB,
  KMAP_TIMELINE_TB,
  KMAP_NODE_TRIGGER,
  MAIN_NODE_TRR: KMAP_NODE_TRIGGER,
  MAIN_NODE_GEN_MODEL: `gen_main_node_model`,
};

export function formatKbData(kbDataArray: any[]): string {
  return kbDataArray
    .map((item) => {
      let content = item.chunk_content
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/<p>/g, "\n")
        .replace(/<\/p>/g, "")
        .replace(/\*?\[.*?\]\(.*?\)/g, (match: any) => {
          const urlMatch = match.match(/\((.*?)\)/);
          if (urlMatch && urlMatch[1]) {
            return `(${urlMatch[1]})`;
          }
          return "";
        })
        .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, "($1)")
        .replace(/<\/?[^>]+(>|$)/g, "") // remove remaining HTML tags
        .trim();

      content = content.replace(/\*+/g, "");

      return `- ${content}`;
    })
    .join("\n");
}
