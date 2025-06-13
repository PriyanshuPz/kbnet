interface NodeData {
  title: string;
  content: string;
  source: string;
  sourceName: string;
  relevance: string;
  tags: string[];
  publishedAt: string;
  url: string;
  relatedNodes: Array<{
    id: string;
    title: string;
    source: string;
    sourceName: string;
  }>;
}
