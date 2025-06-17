import mindsdb, { type SqlQueryResult } from "mindsdb-js-sdk";
import dotenv from "dotenv";

dotenv.config();
const config = {
  host: process.env.MINDSDB_HOST || "http://localhost:47334",
  user: process.env.MINDSDB_USER || "mindsdb",
  password: process.env.MINDSDB_PASSWORD || "mindsdb",
};

export async function connectMindsDB() {
  try {
    // @ts-ignore
    await mindsdb.default.connect(config);

    console.log("Connected to MindsDB successfully");
  } catch (error) {
    console.error("Failed to connect to MindsDB:", error);
    throw error;
  }
}

export async function runMindsDBQuery(query: string): Promise<SqlQueryResult> {
  try {
    // @ts-ignore
    const result = await mindsdb.default.SQL.runQuery(query);
    return result;
  } catch (error) {
    console.error("Error executing MindsDB query:", error);
    throw error;
  }
}
