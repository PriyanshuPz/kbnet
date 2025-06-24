import { MindsDBConfig } from "@kbnet/shared";
import { sanitizeSQLValue } from "./util";
import { mindsDBUrl } from "..";

export async function runMindsDBQuery(query: string) {
  try {
    const res = await fetch(`${mindsDBUrl}/api/sql/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const rawData: any = await res.json();

    if (rawData.type == "error") {
      throw new Error(`MindsDB error: ${rawData.error_message}`);
    }

    // Transform the data to array of objects
    const transformedData = rawData.data.map((row: any[]) => {
      const obj: Record<string, string | number> = {};
      rawData.column_names.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    return transformedData;
  } catch (error) {
    console.log("Error during fetch:", error);
    throw error; // Re-throw to be handled by caller if needed
  }
}

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

    console.log(kbdata);
    kbdata = {
      rows: [],
    };
  }

  return kbdata;
}
