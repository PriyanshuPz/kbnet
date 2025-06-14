import MindsDB from "mindsdb-js-sdk";

const config = {
  host: process.env.MINDSDB_HOST || "http://localhost:47334",
  user: process.env.MINDSDB_USER || "mindsdb",
  password: process.env.MINDSDB_PASSWORD || "mindsdb",
};

export async function connectMindsDB() {
  try {
    await MindsDB.connect(config);
    console.log("Connected to MindsDB successfully");
  } catch (error) {
    console.error("Failed to connect to MindsDB:", error);
    throw error;
  }
}
