import MindsDB from "mindsdb-js-sdk";
import { MindsDBConfig } from "@kbnet/shared";

const LLM_API_KEY = process.env.GEMINI_API_KEY;

class Kb {
  async createKB() {
    try {
      await MindsDB.SQL.runQuery(`
      CREATE PROJECT IF NOT EXISTS ${MindsDBConfig.PROJECT_NAME}
    `);

      let query = await MindsDB.SQL.runQuery(`
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

      console.log("Knowledge Base:", query.type);
    } catch (error) {
      console.error("Error creating knowledge base:", error);
      throw error;
    }
  }
}

export default new Kb();
