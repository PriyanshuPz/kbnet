import datasources from "./scripts/datasources.js";
import kb from "./scripts/kb.js";
import agents from "./scripts/agents.js";
import jobs from "./scripts/jobs.js";
import ml from "./scripts/ml.js";
import dotenv from "dotenv";
dotenv.config();

export async function seed() {
  try {
    await kb.createKB();
    await datasources.createDatasource();
    await jobs.createPendingSummaryView();
    await ml.setup();
    await jobs.createSummaryGenerationJob();
    await agents.createAgent();
    console.log("MindsDB setup completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

seed().catch((error) => {
  console.error("Error in seed function:", error);
});
