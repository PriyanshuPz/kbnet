export enum MessageType {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  SEARCH = "search",
  START_SEARCH = "start_search",
  NEW_KMAP = "new_kmap",
  SEARCH_RESULT = "search_result",
  MESSAGE = "message",
  ERROR = "error",
  PING = "ping",
  PONG = "pong",
  SESSION_CREATED = "session_created",
  NODE_GENERATED = "node_generated",
  NAVIGATION_COMPLETE = "navigation_complete",
  SESSION_ERROR = "session_error",
  NAVIGATE = "navigate",
  RESUME_SESSION = "resume_session",
  GET_VIEWPORT = "get_viewport",
  GET_MINIMAP = "GET_MINIMAP",
  MINIMAP_DATA = "MINIMAP_DATA",
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
  MAIN_NODE_GEN_MODEL_PROMPT: (
    query: string,
    kb_context: any
  ) => `The user is starting a new knowledge map with the query: "${query}"

1. Generate a concise, informative, and engaging summary of the topic "${query}" to use as the main node.

2. Create 3 to 5 curiosity-driven edges phrased as:
   - Questions the user would naturally want to explore next.
   - Interesting, potentially unexpected follow-up ideas.

Here’s some relevant knowledge already found in the background (use it to make your answer more detailed or to avoid repeating known things):
---
${formatKbData(kb_context)}
---

The exploration timeline is empty as this is the starting point.

The edges should invite exploration. For example:
- "What surprising applications does ${query} have?"
- "Who are the most influential people in this field?"
- "What is the future of ${query}?"
- "What controversial debates exist around this topic?"

Make your responses natural, intriguing, and make the user want to click.
`,
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
