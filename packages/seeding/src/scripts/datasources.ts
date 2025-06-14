import MindsDB from "mindsdb-js-sdk";
import { MindsDBConfig } from "@kbnet/shared";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

type RsType = "table" | "error" | "ok";

const HACKERNEWS_DS = MindsDBConfig.HACKERNEWS_DS;
const MEDIAWIKI_DS = MindsDBConfig.MEDIAWIKI_DS;
const WEB_DS = MindsDBConfig.WEB_DS;
const YOUTUBE_DS = MindsDBConfig.YOUTUBE_DS;
const APPDB_DS = MindsDBConfig.APPDB_DS;

class MakeDatasource {
  async createDatasource(): Promise<void> {
    try {
      // Create datasources
      let _yt = await this.youtubeDS();
      let _hn = await this.hackernewsDS();
      let _mwiki = await this.mediawikiDS();
      let _web = await this.webDS();
      let _appdb = await this.appDB();
      console.log("Datasources:", {
        youtube: _yt,
        hackernews: _hn,
        mediawiki: _mwiki,
        web: _web,
        appdb: _appdb,
      });
    } catch (error) {
      console.error("Error creating datasource:", error);
      throw error;
    }
  }

  // Good for now
  async hackernewsDS(): Promise<RsType> {
    try {
      const hackernewsDatasource = await MindsDB.SQL.runQuery(`
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
  async mediawikiDS(): Promise<RsType> {
    try {
      const mediawikiDatasource = await MindsDB.SQL.runQuery(`
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
  async webDS(): Promise<RsType> {
    try {
      const webDatasource = await MindsDB.SQL.runQuery(`
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
  async youtubeDS(): Promise<RsType> {
    try {
      if (!YOUTUBE_API_KEY) {
        throw new Error("YOUTUBE_API_KEY is not set in environment variables");
      }
      const youtubeDatasource = await MindsDB.SQL.runQuery(`
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

  async appDB(): Promise<RsType> {
    try {
      const config = {
        host: process.env.DB_HOST || "db",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "mindsdb",
        user: process.env.DB_USER || "mindsdb",
        password: process.env.DB_PASSWORD || "mindsdb",
      };
      const appDBDatasource = await MindsDB.SQL.runQuery(`
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
