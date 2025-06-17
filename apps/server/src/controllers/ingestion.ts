import { ingestArxiv, ingestMediawiki } from "../lib/ingests";

export function initiateIngestion(query: string): void {
  // Start background ingestion (don't await)
  ingestArxiv(query);
  ingestMediawiki(query);
}
