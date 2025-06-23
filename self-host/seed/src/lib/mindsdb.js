const config = {
  host: "http://localhost:47334",
};

export async function runMindsDBQuery(query) {
  try {
    const res = await fetch(`${config.host}/api/sql/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const rawData = await res.json();

    if (rawData.type === "error") {
      throw new Error(`MindsDB error: ${rawData.error_message}`);
    }
    if (rawData.type !== "table") {
      return [
        { message: "Query executed successfully, but no table data returned." },
      ];
    }
    // Transform the data to array of objects
    const transformedData = rawData.data.map((row) => {
      const obj = {};
      rawData.column_names.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    return transformedData;
  } catch (error) {
    console.error("Error executing MindsDB query:", error.message);
    throw error;
  }
}
