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
}

export default new ML();
