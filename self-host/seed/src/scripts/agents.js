import { runMindsDBQuery } from "../lib/mindsdb.js";
import { MindsDBConfig, SUMMARY_AGENT_SYSTEM_PROMPT } from "../lib/config.js";

const LLM_API_KEY = process.env.GEMINI_API_KEY;

class Agents {
  async createAgent() {
    try {
      let query = await runMindsDBQuery(`
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

      console.log("Agent :", query);
    } catch (error) {
      console.error("Error creating Agent:", error.message);
    }
  }
}

export default new Agents();
