import MindsDB from "mindsdb-js-sdk";
const PROJECT_NAME = "kbnet";
const KB_NAME = `${PROJECT_NAME}.kb`;

const LLM_PROVIDER = "gemini";
const LLM_API_KEY = process.env.GEMINI_API_KEY;

class Kb {
  async createKB() {
    try {
      // No authentication needed for self-hosting
      await MindsDB.connect({
        host: "http://localhost:47334",
        user: "mindsdb",
        password: "mindsdb",
      });

      await MindsDB.SQL.runQuery(`
      CREATE PROJECT IF NOT EXISTS ${PROJECT_NAME}
    `);

      let query = await MindsDB.SQL.runQuery(`
      CREATE KNOWLEDGE_BASE IF NOT EXISTS ${KB_NAME}
      USING
        embedding_model = {
            "provider": "${LLM_PROVIDER}",
            "model_name": "text-embedding-004",
            "api_key": "${LLM_API_KEY}"
        },
        reranking_model = {
            "provider": "${LLM_PROVIDER}",
            "model_name": "gemini-2.0-flash",
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
export { KB_NAME, PROJECT_NAME };
