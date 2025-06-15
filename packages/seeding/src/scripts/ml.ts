import MindsDB from "mindsdb-js-sdk";
import { MindsDBConfig } from "@kbnet/shared";

const LLM_API_KEY = process.env.GEMINI_API_KEY;

class ML {
  async createML() {
    try {
      let query = await MindsDB.SQL.runQuery(`
      CREATE ML_ENGINE IF NOT EXISTS ${MindsDBConfig.ML_ENGINE_NAME}
      FROM google_gemini
      USING
        api_key = '${LLM_API_KEY}';
    `);

      console.log("ML Base:", query.type);
    } catch (error) {
      console.error("Error creating ML:", error);
      throw error;
    }
  }

  async createModels() {
    try {
      let query = await MindsDB.SQL.runQuery(`
      CREATE MODEL IF NOT EXISTS ${MindsDBConfig.MAIN_NODE_GEN_MODEL}
      PREDICT json
      USING
        engine = '${MindsDBConfig.ML_ENGINE_NAME}',
        model_name = '${MindsDBConfig.LLM_MODEL}',
        json_struct = {
          "label": "Main topic or node title",
          "content": "Detailed but digestible explanation for the node",
          "source": "KB",
          "isMain": true,
          "edges": [
            {
              "label": "Curiosity-driven question or idea to explore",
              "hint": "Optional additional context or curiosity hook"
            },
            {
              "label": "Another question or subtopic",
              "hint": "Optional hint"
            }
          ]
        };

        `);
      // input_text = '${MindsDBConfig.MAIN_NODE_GEN_MODEL_PROMPT}';

      console.log("Model created:", query.type);
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  }
}

export default new ML();
