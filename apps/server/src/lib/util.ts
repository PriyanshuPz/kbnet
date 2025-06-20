import { MindsDBConfig } from "@kbnet/shared";
import { XMLParser } from "fast-xml-parser";
import { createId } from "@paralleldrive/cuid2";

export function sanitizeSQLValue(value: any): string {
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function parseArxivXML(xml: string) {
  const parser = new XMLParser();
  const json = parser.parse(xml);
  const entries = json.feed.entry || [];

  return entries.map((entry: any) => ({
    title: entry.title,
    summary: entry.summary,
    link: entry.id,
    time: entry.published,
  })) as {
    title: string;
    summary: string;
    link: string;
    time: string;
  }[];
}

type DataEntry = {
  id: string;
  content: string;
  metadata: {
    title: string;
    url: string;
    time: string;
    image_url?: string;
    source?: string;
  };
};

export const FEED_KB_QUERY = (data: DataEntry, source: string) => `
INSERT INTO ${MindsDBConfig.KB_NAME} (id, content, metadata)
SELECT
  '${data.id}' AS id,
  '${data.content.replace(/'/g, "''")}' AS content,
  JSON_OBJECT(
    'title', '${data.metadata.title.replace(/'/g, "''")}',
    'url', '${data.metadata.url}',
    'published_at', '${String(data.metadata.time)}',
    'source', '${source}',
    'image_url', '${(data.metadata.image_url || "").replace(/'/g, "''")}'
  ) AS metadata;
`;

export function generateId(prefix: string): string {
  const randomness = createId();

  return `${prefix}-${randomness}`;
}
