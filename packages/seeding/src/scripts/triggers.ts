import { MindsDBConfig } from "@kbnet/shared";
import MindsDB from "mindsdb-js-sdk";

class Triggers {
  async createTriggers() {
    try {
      console.log("Trigger created successfully");
    } catch (error) {
      console.error("Error creating trigger:", error);
    }
  }
}

export default new Triggers();
