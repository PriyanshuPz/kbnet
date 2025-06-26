import { connectionConfig, MindsDBConfig } from "../lib/config.js";
import { runMindsDBQuery } from "../lib/mindsdb.js";

class Jobs {
  async setup() {
    try {
      await this.createPendingSummaryView();
      await this.createSummaryGenerationJob();
      await this.createTestDataJob();
      await this.createEvaluationJob();
      console.log("All jobs created successfully.");
    } catch (error) {
      console.error("Error creating jobs:", error);
      throw error;
    }
  }

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

  async createTestDataJob() {
    try {
      const job = await runMindsDBQuery(`
        CREATE JOB IF NOT EXISTS ${MindsDBConfig.NODES_TEST_DATA_JOB} AS (
        INSERT INTO ${MindsDBConfig.NODES_TEST_DATA} (question, answer, node_id, map_id) (
            SELECT
                n.id as id,
                n.title AS question,
                n.summary AS answer,
                n.id AS node_id,
                step.map_id AS map_id
            FROM ${MindsDBConfig.NODES} AS n
            LEFT JOIN ${MindsDBConfig.NAVIGATION_STEPS} AS step ON n.id = step.node_id
            WHERE n.is_processed = false
            LIMIT 20
          );

          UPDATE ${MindsDBConfig.NODES} SET is_processed = true
            FROM (
                SELECT node_id FROM ${MindsDBConfig.NODES_TEST_DATA} ORDER BY created_at DESC LIMIT 20
            ) as etd
          WHERE id = etd.node_id;

          INSERT INTO ${MindsDBConfig.KB_NAME} (id, content, metadata) (
              SELECT
                  etd.node_id AS id,
                  etd.answer AS content,
                  etd.question as title,
                  'platform' as source,
                  etd.created_at as published_at,
                  etd.node_id as url
              FROM ${MindsDBConfig.NODES_TEST_DATA} AS etd
              ORDER BY etd.created_at DESC
              LIMIT 20
          );
        )
        EVERY 30 MINUTES
        IF (SELECT COUNT(*) > 0 FROM ${MindsDBConfig.NODES} WHERE is_processed = false);
        `);

      console.log(
        "Summary nodes test data sync job created successfully:",
        job
      );
    } catch (error) {
      console.error("Error creating nodes test data sync job:", error);
      throw error;
    }
  }

  async createEvaluationJob() {
    try {
      const job = await runMindsDBQuery(`
        CREATE JOB IF NOT EXISTS ${MindsDBConfig.EVALUATION_TEST_DATA_JOB} AS (
        EVALUATE KNOWLEDGE_BASE ${MindsDBConfig.KB_NAME}
        USING
            test_table = ${MindsDBConfig.NODES_TEST_DATA},
            version = 'llm_relevancy',
            evaluate = true,
            llm = {
                'provider': '${connectionConfig.useGroqForEvaluation ? "groq" : "gemini"}',
                'api_key':'${connectionConfig.useGroqForEvaluation ? connectionConfig.groqAPIKey : connectionConfig.geminiAPIKey}',
                'model_name':'${connectionConfig.useGroqForEvaluation ? "qwen/qwen3-32b" : MindsDBConfig.LLM_MODEL}'
            },
            save_to = appdb_ds.evaluations_metrics;

          INSERT INTO appdb_ds.evaluations (id, results_id, map_ids)
            SELECT
            gen_random_uuid() as id,
            m.id as results_id,
            ARRAY_AGG(DISTINCT etd.map_id) as map_ids
            FROM appdb_ds.evaluations_metrics as m
            JOIN appdb_ds.evaluation_test_data AS etd
            WHERE etd.map_id IS NOT NULL
            GROUP BY m.id, m.created_at
            ORDER BY m.created_at DESC
            LIMIT 1;

          DELETE FROM appdb_ds.evaluation_test_data;
        )
        EVERY 31 MINUTES
        IF (SELECT COUNT(*) > 0 FROM ${MindsDBConfig.NODES_TEST_DATA});
        `);

      console.log(
        "Summary nodes test data sync job created successfully:",
        job
      );
    } catch (error) {
      console.error("Error creating nodes test data sync job:", error);
      throw error;
    }
  }
}

export default new Jobs();
