import { connectionConfig, MindsDBConfig } from "../lib/config.js";
import { runMindsDBQuery } from "../lib/mindsdb.js";

const API_KEY = connectionConfig.geminiAPIKey;
class ML {
  async setup() {
    try {
      await this.createMLEngine();
      await this.createModel();
    } catch (error) {
      console.error("Error setting up ML:", error);
      throw error;
    }
  }
  async createMLEngine() {
    try {
      const query = await runMindsDBQuery(`
        CREATE ML_ENGINE IF NOT EXISTS ${MindsDBConfig.ML_ENGINE_NAME}
        FROM google_gemini
        USING
          api_key = "${API_KEY}";
      `);
      console.log("ML Engine created.", query);
    } catch (error) {
      console.error("Error creating ML Engine:", error);
      throw error;
    }
  }

  async createModel() {
    try {
      const query = await runMindsDBQuery(`
      CREATE MODEL IF NOT EXISTS ${MindsDBConfig.MAIN_NODE_GEN_MODEL}
      PREDICT answer
      USING
        engine = "${MindsDBConfig.ML_ENGINE_NAME}",
        model_name = "${MindsDBConfig.LLM_MODEL}",
        question_column = "question"
        `);

      console.log("Model created:", query);
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  }
}

export default new ML();
