import datasources from "./scripts/datasources.js";
import kb from "./scripts/kb.js";
import agents from "./scripts/agents.js";
import jobs from "./scripts/jobs.js";
import ml from "./scripts/ml.js";
import { connectMindsDB } from "./lib/mindsdb.js";

export async function seed() {
  try {
    await connectMindsDB();
    await jobs.createPendingSummaryView();
    await jobs.createSummaryGenerationJob();
    await datasources.createDatasource();
    await kb.createKB();
    await agents.createAgent();
    await ml.setup();
    console.log("MindsDB setup completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

seed().catch((error) => {
  console.error("Error in seed function:", error);
});
