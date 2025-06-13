import MindsDB from "mindsdb-js-sdk";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

enum DatasourceType {
  HACKERNEWS = "hackernews",
  MEDIAWIKI = "mediawiki",
  WEB = "web",
  YOUTUBE = "youtube",
}

type RsType = "table" | "error" | "ok";

const HACKERNEWS_DS = "hackernews_ds";
const MEDIAWIKI_DS = "mediawiki_ds";
const WEB_DS = "web_ds";
const YOUTUBE_DS = "youtube_ds";

class MakeDatasource {
  async createDatasource(): Promise<void> {
    try {
      // Connect to MindsDB instance
      await MindsDB.connect({
        host: "http://localhost:47334",
        user: "mindsdb",
        password: "mindsdb",
      });
      console.log("Connected to MindsDB instance");
      // Create datasources
      let _yt = await this.youtubeDS();
      let _hn = await this.hackernewsDS();
      let _mwiki = await this.mediawikiDS();
      let _web = await this.webDS();
      console.log("Datasources:", {
        youtube: _yt,
        hackernews: _hn,
        mediawiki: _mwiki,
        web: _web,
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
}

export default new MakeDatasource();
export { DatasourceType, HACKERNEWS_DS, MEDIAWIKI_DS, WEB_DS, YOUTUBE_DS };
