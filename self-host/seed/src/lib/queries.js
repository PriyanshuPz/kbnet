import { DatasourceType, MindsDBConfig } from "@kbnet/shared";

export const HACKERNEWS_STORY_FEED_QUERY = (limit = 10) => `
INSERT INTO ${MindsDBConfig.KB_NAME} (id, content, metadata)
  SELECT
    CONCAT('${DatasourceType.HACKERNEWS}_', id) AS id,
    IFNULL(text, title) AS content,
    JSON_OBJECT(
        'title', title,
        'url', CONCAT('https://news.ycombinator.com/item?id=', id),
        'published_at', time,
        'source', '${DatasourceType.HACKERNEWS}',
        'tags', JSON_ARRAY('hackernews', 'news')
    ) AS metadata
    FROM ${MindsDBConfig.HACKERNEWS_DS}.showstories
    LIMIT ${limit};
`;
