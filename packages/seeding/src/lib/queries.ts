import { DatasourceType, HACKERNEWS_DS } from "../scripts/datasources";
import { KB_NAME } from "../scripts/kb";

export const HACKERNEWS_STORY_FEED_QUERY = (limit = 10) => `
INSERT INTO ${KB_NAME} (id, content, metadata)
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
    FROM ${HACKERNEWS_DS}.showstories
    LIMIT ${limit};
`;
