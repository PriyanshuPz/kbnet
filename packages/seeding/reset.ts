import dotenv from "dotenv";
import { connectMindsDB } from "./src/lib/mindsdb";
import MindsDB from "mindsdb-js-sdk";
import { MindsDBConfig } from "@kbnet/shared";

dotenv.config();

async function reset() {
  try {
    await connectMindsDB();
    // Reset the MindsDB instance
    await MindsDB.SQL.runQuery(`
      DROP TRIGGER ${MindsDBConfig.MAIN_NODE_TRR};
      `);
    await MindsDB.SQL.runQuery(`
      DROP MODEL ${MindsDBConfig.MAIN_NODE_GEN_MODEL};
      `);
    await MindsDB.SQL.runQuery(`
      DROP ML_ENGINE ${MindsDBConfig.ML_ENGINE_NAME};
      `);
  } catch (error) {
    console.log(error);
  }
}

reset().catch((error) => {
  console.error("Error in reset function:", error);
});
