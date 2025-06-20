import datasources from "./scripts/datasources";
import kb from "./scripts/kb";
import agents from "./scripts/agents";
import jobs from "./scripts/jobs";
import { connectMindsDB } from "@kbnet/shared";

export async function seed() {
  try {
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
