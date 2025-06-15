import { MindsDBConfig } from "@kbnet/shared";
import MindsDB from "mindsdb-js-sdk";

class Triggers {
  async createTriggers() {
    try {
      // Create a trigger for the 'k_map' table
      await MindsDB.SQL.runQuery(`
        CREATE TRIGGER ${MindsDBConfig.MAIN_NODE_TRR}
        ON ${MindsDBConfig.KMAP_TB}
        (
          INSERT INTO ${MindsDBConfig.KMAP_NODE_TB} (id, kmapId, label, content, source, isMain)
          SELECT
            UUID() AS id,
            d.id AS kmapId,
            'Main Node' AS label,
            m.node_content AS content,
            'AI' AS source,
            true AS isMain
          FROM ${MindsDBConfig.KMAP_TB} AS d
          JOIN ${MindsDBConfig.MAIN_NODE_GEN_MODEL} AS m
          WHERE m.query = d.query;
        )
      `);
      console.log("Trigger created successfully");
    } catch (error) {
      console.error("Error creating trigger:", error);
    }
  }
}

export default new Triggers();
