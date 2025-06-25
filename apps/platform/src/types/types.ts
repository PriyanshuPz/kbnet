type Direction = "left" | "right" | "up" | "down";

type EvolutionMetric = {
  id: number;
  avg_relevancy?: number;
  avg_relevance_score_by_k?: number[];
  avg_first_relevant_position?: number;
  mean_mrr?: number;
  hit_at_k?: number[];
  bin_precision_at_k?: number[];
  avg_entropy?: number;
  avg_ndcg?: number;
  avg_query_time?: number;
  name: string;
  created_at: string;
};
