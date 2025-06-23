import { MindsDBConfig } from "../lib/config.js";
import { runMindsDBQuery } from "../lib/mindsdb.js";

class Jobs {
  async createPendingSummaryView() {
    try {
      const view = await runMindsDBQuery(`
        CREATE VIEW IF NOT EXISTS ${MindsDBConfig.PENDING_SUMMARY_VIEW_NAME} AS (
          SELECT
          id,
          map_id,
          CONCAT('Summarize the map with ID: ', map_id) AS question,
          status
          FROM appdb_ds.map_summaries
          WHERE status in ('PENDING', 'IN_PROGRESS')
          ORDER BY requested_at ASC
        )
      `);

      console.log("Pending Summary view created successfully:", view);
    } catch (error) {
      console.error("Error creating Pending Summary view:", error);
      throw error;
    }
  }

  async createSummaryGenerationJob() {
    try {
      const job = await runMindsDBQuery(`
        CREATE JOB IF NOT EXISTS ${MindsDBConfig.SUMMARY_JOB_NAME} AS (
          UPDATE appdb_ds.map_summaries SET status = 'IN_PROGRESS'
          FROM (SELECT * FROM ${MindsDBConfig.PENDING_SUMMARY_VIEW_NAME} LIMIT 1) AS d
          WHERE id = d.id;

          UPDATE appdb_ds.map_summaries SET status = 'COMPLETED', summary = d.answer, completed_at = NOW()
          FROM (
              SELECT
                  p.id as id,
                  r.answer as answer
              FROM ${MindsDBConfig.SUMMARY_AGENT_NAME} as r
              JOIN (
                  SELECT id, question FROM ${MindsDBConfig.PENDING_SUMMARY_VIEW_NAME}
                  WHERE status = 'IN_PROGRESS'
                  ) as p
              WHERE r.question = p.question
          ) as d
          WHERE id = d.id;
        )
        EVERY 5 MINUTES
        IF (SELECT COUNT(*) > 0 FROM ${MindsDBConfig.PENDING_SUMMARY_VIEW_NAME} WHERE status in ('PENDING','IN_PROGRESS'));
        `);

      console.log("Summary sync job created successfully:", job);
    } catch (error) {
      console.error("Error creating Summary sync job:", error);
      throw error;
    }
  }
}

export default new Jobs();
