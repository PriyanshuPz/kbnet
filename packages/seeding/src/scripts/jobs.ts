import MindsDB from "mindsdb-js-sdk";
import { MindsDBConfig } from "@kbnet/shared";

class Jobs {
  async createSummaryGenerationJob() {
    try {
      const job = await MindsDB.SQL.runQuery(`
        CREATE JOB IF NOT EXISTS ${MindsDBConfig.SUMMARY_JOB_NAME} AS (

        )
        EVERY 6 HOUR
        `);

      console.log("Hacker News sync job created successfully:", job.type);
    } catch (error) {
      console.error("Error creating Hacker News sync job:", error);
      throw error;
    }
  }
}

export default new Jobs();
