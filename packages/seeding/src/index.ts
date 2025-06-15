import dotenv from "dotenv";
import datasources from "./scripts/datasources";
import kb from "./scripts/kb";
import ml from "./scripts/ml";
import { connectMindsDB } from "./lib/mindsdb";

dotenv.config();

async function seed() {
  try {
    // Connect to MindsDB instance
    await connectMindsDB();

    await datasources.createDatasource();
    await kb.createKB();
    // await jobs.createHackernewsSyncJob();
    await ml.createML();
    await ml.createModels();
    // await triggers.createTriggers();
    console.log("MindsDB setup completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

seed().catch((error) => {
  console.error("Error in main function:", error);
});
