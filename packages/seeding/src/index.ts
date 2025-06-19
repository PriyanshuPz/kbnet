import dotenv from "dotenv";
import datasources from "./scripts/datasources";
import kb from "./scripts/kb";
import agents from "./scripts/agents";
import { connectMindsDB } from "./lib/mindsdb";
import jobs from "./scripts/jobs";

dotenv.config();

async function seed() {
  try {
    // Connect to MindsDB instance
    await connectMindsDB();

    await jobs.createPendingSummaryView();
    await jobs.createSummaryGenerationJob();
    await datasources.createDatasource();
    await kb.createKB();
    await agents.createAgent();
    console.log("MindsDB setup completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

seed().catch((error) => {
  console.error("Error in main function:", error);
});
