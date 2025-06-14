import dotenv from "dotenv";
import datasources from "./scripts/datasources";
import kb from "./scripts/kb";
import jobs from "./scripts/jobs";
import ml from "./scripts/ml";
import { connectMindsDB } from "./lib/mindsdb";

dotenv.config();

async function seed() {
  try {
    // Connect to MindsDB instance
    await connectMindsDB();

    await datasources.createDatasource();
    await kb.createKB();
    await jobs.createHackernewsSyncJob();
    await ml.createML();
    console.log("MindsDB setup completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

seed().catch((error) => {
  console.error("Error in main function:", error);
});
