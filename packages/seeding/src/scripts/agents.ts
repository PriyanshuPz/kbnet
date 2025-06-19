import MindsDB from "mindsdb-js-sdk";
import { MindsDBConfig, SUMMARY_AGENT_SYSTEM_PROMPT } from "@kbnet/shared";

const LLM_API_KEY = process.env.GEMINI_API_KEY;

class Agents {
  async createAgent() {
    try {
      await MindsDB.SQL.runQuery(`
        DROP AGENT ${MindsDBConfig.SUMMARY_AGENT_NAME};
      `);

      let query = await MindsDB.SQL.runQuery(`
      CREATE AGENT IF NOT EXISTS ${MindsDBConfig.SUMMARY_AGENT_NAME}
      USING
        model = '${MindsDBConfig.LLM_MODEL}',
        google_api_key = '${LLM_API_KEY}',
        include_knowledge_bases = ['${MindsDBConfig.KB_NAME}'],
        include_tables = [
          '${MindsDBConfig.MAPS}',
          '${MindsDBConfig.NODES}',
          '${MindsDBConfig.NAVIGATION_STEPS}',
          '${MindsDBConfig.NODE_RELATIONSHIPS}'
        ],
        prompt_template = '${SUMMARY_AGENT_SYSTEM_PROMPT.replace(/'/g, "''")}';
    `);

      console.log("Agent :", query.type);
    } catch (error) {
      console.error("Error creating Agent:", error);
      throw error;
    }
  }
}

export default new Agents();
