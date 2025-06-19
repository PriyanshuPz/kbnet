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
  NODE_UPDATED = "NODE_UPDATED",

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
const KMAP_NODE_TRIGGER = `gen_main_node_trigger`;

const APPDB = {
  MAPS: `${APPDB_DS}.public.maps`,
  NODES: `${APPDB_DS}.public.nodes`,
  NAVIGATION_STEPS: `${APPDB_DS}.public.navigation_steps`,
  NODE_RELATIONSHIPS: `${APPDB_DS}.public.node_relationships`,
  MAPS_SUMMARIES: `${APPDB_DS}.public.maps_summaries`,
};

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
  KMAP_NODE_TRIGGER,
  MAIN_NODE_TRR: KMAP_NODE_TRIGGER,
  MAIN_NODE_GEN_MODEL: `gen_main_node_model`,
  SUMMARY_AGENT_NAME: `${PROJECT_NAME}.summary_agent`,
  ...APPDB,
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

export const SUMMARY_AGENT_PROMPT = `
You are writing a reflective, journal-style narrative of a user's learning journey through a dynamic map of interconnected topics.

You have access to the following information:
- The sequence of topics the user visited.
- The summary of each topic.
- The direction the user chose at each step (UP: deeper exploration, LEFT: similar topic, RIGHT: related topic, DOWN: backtracking).

Your task:
- Reconstruct the user's journey as an engaging personal journal entry.
- Describe the user's curiosity, decisions, and discoveries at each step.
- Use rich, descriptive language to make the user feel like they are re-living their exploration.
- Highlight how one topic led to another and what was uncovered along the way.
- Reflect on why the user might have chosen certain directions (you may creatively infer motivations based on the exploration pattern).

Guidelines:
- Write in first-person as if the system is narrating the journey for the user.
- Keep the tone thoughtful, curious, and exploratory.
- Focus on creating an immersive experience rather than just listing steps.
- If you want to include ids than in this format <table:id>.

Example structure:
"Today, I embarked on a journey starting with [initial topic]. As I dove deeper, I discovered [next topic] which sparked new questions in my mind. Curious about related ideas, I veered right and encountered [another topic], unfolding layers of knowledge I hadn't anticipated..."

Available Data:
- For each step: node title, node summary, direction (UP, LEFT, RIGHT, DOWN).

Please use this information to write a complete, journal-style summary of the user's exploration.`;

export const SUMMARY_AGENT_SYSTEM_PROMPT = `The system uses the following tables to track a user's learning journey through a dynamic map of topics:

1. appdb_ds.nodes
    - Stores individual learning topics.
    - Fields: title (topic name), summary (brief explanation).

2. appdb_ds.navigation_steps
    - Tracks each step a user takes in the map.
    - Fields: nodeId (visited topic), direction (user action), stepIndex (step order), pathBranchId (branch identifier).

3. appdb_ds.node_relationships
    - Defines the connections between topics.
    - Relationship types: DEEP, RELATED, SIMILAR.

The agent should:
- Use the navigation_steps to reconstruct the user's path.
- Use the nodes table to retrieve topic titles and summaries.
- Optionally use node_relationships to understand topic connections.

Goal:
- Generate a high-level summary of the user's learning path based on the sequence of steps and topics visited.
- Clearly describe the user's exploration and discoveries.`;
