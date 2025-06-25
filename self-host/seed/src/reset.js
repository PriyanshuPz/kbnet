import dotenv from "dotenv";
import { MindsDBConfig } from "./lib/config.js";
import { runMindsDBQuery } from "./lib/mindsdb.js";
dotenv.config();

async function reset() {
  try {
    await runMindsDBQuery(`
      DROP MODEL ${MindsDBConfig.MAIN_NODE_GEN_MODEL};
    `);
    await runMindsDBQuery(`
      DROP ML_ENGINE ${MindsDBConfig.ML_ENGINE_NAME};
    `);

    await runMindsDBQuery(`
      DROP JOB ${MindsDBConfig.SUMMARY_JOB_NAME};
    `);
    await runMindsDBQuery(`
      DROP VIEW ${MindsDBConfig.PENDING_SUMMARY_VIEW_NAME};
    `);
    await runMindsDBQuery(`
      DROP AGENT ${MindsDBConfig.SUMMARY_AGENT_NAME};
    `);
    await runMindsDBQuery(`
      DROP KNOWLEDGE_BASE ${MindsDBConfig.KB_NAME};
    `);

    await runMindsDBQuery(`
      DROP DATABASE ${MindsDBConfig.MEDIAWIKI_DS};
    `);
    await runMindsDBQuery(`
      DROP DATABASE ${MindsDBConfig.WEB_DS};
    `);
    await runMindsDBQuery(`
      DROP DATABASE ${MindsDBConfig.APPDB_DS};
    `);
    console.log("MindsDB reset completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

reset().catch((error) => {
  console.error("Error in reset function:", error);
});
