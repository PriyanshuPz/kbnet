import { connectionConfig, MindsDBConfig } from "../lib/config.js";
import { runMindsDBQuery } from "../lib/mindsdb.js";

const MEDIAWIKI_DS = MindsDBConfig.MEDIAWIKI_DS;
const WEB_DS = MindsDBConfig.WEB_DS;
const APPDB_DS = MindsDBConfig.APPDB_DS;

class MakeDatasource {
  async createDatasource() {
    try {
      // Create datasources
      await this.mediawikiDS();
      let _web = await this.webDS();
      let _appdb = await this.appDB();
      console.log("Datasources:", {
        web: _web,
        appdb: _appdb,
      });
    } catch (error) {
      console.error("Error creating datasource:", error);
      throw error;
    }
  }

  // Good for now
  async mediawikiDS() {
    try {
      const mediawikiDatasource = await runMindsDBQuery(`
        CREATE DATABASE IF NOT EXISTS ${MEDIAWIKI_DS}
          WITH
          ENGINE = 'mediawiki'
        `);
      return mediawikiDatasource;
    } catch (error) {
      console.error(
        "Ensure the MediaWiki extension is installed and configured correctly. Go to http://localhost:47334 and this it from the settings."
      );
    }
  }

  // Good for now
  async webDS() {
    try {
      const webDatasource = await runMindsDBQuery(`
        CREATE DATABASE IF NOT EXISTS ${WEB_DS}
          WITH
          ENGINE = 'web'
        `);
      return webDatasource;
    } catch (error) {
      console.error("Error creating Web datasource:", error);
      throw error;
    }
  }

  async appDB() {
    try {
      const DATABASE_URL = new URL(connectionConfig.databaseURL);

      const config = {
        host: DATABASE_URL.hostname,
        port: DATABASE_URL.port,
        database: DATABASE_URL.pathname.replace("/", ""),
        user: DATABASE_URL.username || "mindsdb",
        password: DATABASE_URL.password || "mindsdb",
      };

      const appDBDatasource = await runMindsDBQuery(`
        CREATE DATABASE IF NOT EXISTS ${APPDB_DS}
          WITH ENGINE = 'postgres',
          PARAMETERS = {
            "host": "${config.host}",
            "port": ${config.port},
            "database": "${config.database}",
            "user": "${config.user}",
            "password": "${config.password}"
        };
        `);
      return appDBDatasource;
    } catch (error) {
      console.error("Error creating App DB datasource:", error);
      throw error;
    }
  }
}

export default new MakeDatasource();
