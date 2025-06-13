import dotenv from "dotenv";
import datasources from "./scripts/datasources";
import kb from "./scripts/kb";
import jobs from "./scripts/jobs";

dotenv.config();

async function seed() {
  try {
    await datasources.createDatasource();
    await kb.createKB();
    await jobs.createHackernewsSyncJob();
    console.log("MindsDB setup completed successfully.");
  } catch (error) {
    console.log(error);
  }
}

seed().catch((error) => {
  console.error("Error in main function:", error);
});
