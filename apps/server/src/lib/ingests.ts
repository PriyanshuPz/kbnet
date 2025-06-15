import { DatasourceType, MindsDBConfig } from "@kbnet/shared";
import { runMindsDBQuery } from "./mindsdb";
import { FEED_KB_QUERY, parseArxivXML } from "./util";

export async function ingestArxiv(query: string) {
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=10&sortBy=relevance`;

  const response = await fetch(url);
  const xmlData = await response.text();

  // Use a simple XML parser to extract entries
  const papers = parseArxivXML(xmlData);

  for (const paper of papers) {
    const q = FEED_KB_QUERY(
      {
        id: paper.link,
        content: paper.summary,
        metadata: {
          title: paper.title,
          url: paper.link,
          time: paper.time,
          image_url: "", // Arxiv doesn't provide images, but you can add a placeholder if needed
          source: DatasourceType.ARXIV,
        },
      },
      "arxiv"
    );
    try {
      const res = await runMindsDBQuery(q);
      console.log(`Ingested paper: ${paper.title}, Result: ${res.type}`);
    } catch (error) {
      console.error(`Error ingesting paper ${paper.title}:`, error);
    }
  }
}

export async function ingestMediawiki(query: string) {
  try {
    const q = `
INSERT INTO ${MindsDBConfig.KB_NAME} (id, content, metadata)
SELECT
  CONCAT('${DatasourceType.MEDIAWIKI}_', pageid) AS id,
  content AS content,
  JSON_OBJECT(
    'title', title,
    'url', url,
    'source', '${DatasourceType.MEDIAWIKI}',
    'tags', JSON_ARRAY('mediawiki', 'wiki')
  ) AS metadata
FROM ${MindsDBConfig.MEDIAWIKI_DS}.pages AS d
WHERE title = '%${query}%'
LIMIT 10;
`;

    const res = await runMindsDBQuery(q);

    console.log(`Ingested Mediawiki pages: ${res.type}`);
  } catch (error) {
    console.error(`Error ingesting:`, error);
  }
}
