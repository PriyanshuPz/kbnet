import { MindsDBConfig, connectionConfig } from "../lib/config.js";
import { runMindsDBQuery } from "../lib/mindsdb.js";

const LLM_API_KEY = connectionConfig.geminiAPIKey;

class Kb {
  async createKB() {
    try {
      await runMindsDBQuery(`
      CREATE PROJECT IF NOT EXISTS ${MindsDBConfig.PROJECT_NAME}
    `);

      let query = await runMindsDBQuery(`
      CREATE KNOWLEDGE_BASE IF NOT EXISTS ${MindsDBConfig.KB_NAME}
      USING
        embedding_model = {
            "provider": "${MindsDBConfig.LLM_PROVIDER}",
            "model_name": "text-embedding-004",
            "api_key": "${LLM_API_KEY}"
        },
        reranking_model = {
            "provider": "${MindsDBConfig.LLM_PROVIDER}",
            "model_name": "${MindsDBConfig.LLM_MODEL}",
            "api_key": "${LLM_API_KEY}"
        },
        metadata_columns = ["title", "source", "published_at", "tags", "url", "image_url"],
        content_columns = ["content"],
        id_column = 'id';
    `);

      console.log("Knowledge Base:", query);
    } catch (error) {
      console.error("Error creating knowledge base:", error);
      throw error;
    }
  }
}

export default new Kb();
