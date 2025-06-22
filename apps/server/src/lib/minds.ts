import { MindsDBConfig } from "@kbnet/shared";
import { runMindsDBQuery } from "@kbnet/shared/mindsdb";
import { sanitizeSQLValue } from "./util";

export async function getKBContext(query: string, enabled = true) {
  if (!enabled) {
    return {
      rows: [
        { chunk_content: `Use your own knowledge base to answer: ${query}` },
      ],
    };
  }

  let kbdata;
  try {
    kbdata = await runMindsDBQuery(`
      SELECT * FROM ${MindsDBConfig.KB_NAME}
      WHERE content = ${sanitizeSQLValue(query)}
      LIMIT 10;
    `);
  } catch (error: any) {
    console.warn(
      "Failed to fetch data from MindsDB going without kb:",
      error.message
    );
    kbdata = {
      rows: [],
    };
  }

  return kbdata;
}
