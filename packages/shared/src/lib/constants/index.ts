import { MindsDBConfig, SUMMARY_AGENT_SYSTEM_PROMPT } from "./configs";

export enum MessageType {
  WELCOME = "welcome",

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

export { MindsDBConfig, SUMMARY_AGENT_SYSTEM_PROMPT };
