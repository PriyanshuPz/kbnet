import MindsDB from "mindsdb-js-sdk";
import { HACKERNEWS_STORY_FEED_QUERY } from "../lib/queries";
import { MindsDBConfig } from "@kbnet/shared";

class Jobs {
  async createHackernewsSyncJob() {
    try {
      const job = await MindsDB.SQL.runQuery(`
        CREATE JOB IF NOT EXISTS ${MindsDBConfig.HACKERNEWS_SYNC_JOB} AS (
        ${HACKERNEWS_STORY_FEED_QUERY(10)}
        )
        EVERY 1 HOUR
        `);

      console.log("Hacker News sync job created successfully:", job.type);
    } catch (error) {
      console.error("Error creating Hacker News sync job:", error);
      throw error;
    }
  }
}

export default new Jobs();
