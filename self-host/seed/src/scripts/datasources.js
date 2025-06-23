import { MindsDBConfig } from "@kbnet/shared/config";
import { runMindsDBQuery } from "../lib/mindsdb.js";
import dotenv from "dotenv";
dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const HACKERNEWS_DS = MindsDBConfig.HACKERNEWS_DS;
const MEDIAWIKI_DS = MindsDBConfig.MEDIAWIKI_DS;
const WEB_DS = MindsDBConfig.WEB_DS;
const YOUTUBE_DS = MindsDBConfig.YOUTUBE_DS;
const APPDB_DS = MindsDBConfig.APPDB_DS;

class MakeDatasource {
  async createDatasource() {
    try {
      // Create datasources
      let _mwiki = await this.mediawikiDS();
      let _web = await this.webDS();
      let _appdb = await this.appDB();
      console.log("Datasources:", {
        mediawiki: _mwiki,
        web: _web,
        appdb: _appdb,
      });
    } catch (error) {
      console.error("Error creating datasource:", error);
      throw error;
    }
  }

  // skip this for now
  async hackernewsDS() {
    try {
      const hackernewsDatasource = await runMindsDBQuery(`
        CREATE DATABASE IF NOT EXISTS ${HACKERNEWS_DS}
          WITH
          ENGINE = 'hackernews'
        `);
      return hackernewsDatasource.type;
    } catch (error) {
      console.error("Error creating Hacker News datasource:", error);
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
      return mediawikiDatasource.type;
    } catch (error) {
      console.error("Error creating MediaWiki datasource:", error);
      throw error;
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
      return webDatasource.type;
    } catch (error) {
      console.error("Error creating Web datasource:", error);
      throw error;
    }
  }

  // I need video id to make this work
  async youtubeDS() {
    try {
      if (!YOUTUBE_API_KEY) {
        throw new Error("YOUTUBE_API_KEY is not set in environment variables");
      }
      const youtubeDatasource = await runMindsDBQuery(`
        CREATE DATABASE IF NOT EXISTS ${YOUTUBE_DS}
          WITH
          ENGINE = 'youtube',
          PARAMETERS = {
            "youtube_api_token": "${YOUTUBE_API_KEY}"
          };
        `);
      return youtubeDatasource.type;
    } catch (error) {
      console.error("Error creating YouTube datasource:", error);
      throw error;
    }
  }

  async appDB() {
    try {
      const DATABASE_URL = new URL(
        process.env.DATABASE_URL ||
          "postgres://mindsdb:mindsdb@kbnet_database:5432/mindsdb"
      );

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
      return appDBDatasource.type;
    } catch (error) {
      console.error("Error creating App DB datasource:", error);
      throw error;
    }
  }
}

export default new MakeDatasource();
