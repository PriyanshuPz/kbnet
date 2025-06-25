import dotenv from "dotenv";
dotenv.config();

// Change the values below to match your MindsDB instance configuration
export const connectionConfig = {
  host: "http://localhost:47334",
  databaseURL: process.env.DATABASE_URL,
  geminiAPIKey: process.env.GEMINI_API_KEY,
  groqAPIKey: process.env.GROQ_API_KEY,
  useGroqForEvaluation: process.env.USE_GROQ_FOR_EVALUATION === "true",
};

const PROJECT_NAME = "kbnet";

export const MindsDBConfig = {
  PROJECT_NAME: PROJECT_NAME,
  KB_NAME: `${PROJECT_NAME}.kb`,
  HACKERNEWS_SYNC_JOB: `${PROJECT_NAME}.hackernews_sync_job`,
  SUMMARY_AGENT_NAME: `${PROJECT_NAME}.summary_agent`,
  SUMMARY_JOB_NAME: `${PROJECT_NAME}.summary_job`,
  PENDING_SUMMARY_VIEW_NAME: `${PROJECT_NAME}.pending_summary_view`,
  NODES_TEST_DATA_JOB: `${PROJECT_NAME}.nodes_test_data_job`,
  EVALUATION_TEST_DATA_JOB: `${PROJECT_NAME}.evaluation_test_data_job`,

  APPDB_DS: "appdb_ds",
  MAPS: `appdb_ds.public.maps`,
  NODES: `appdb_ds.public.nodes`,
  NAVIGATION_STEPS: `appdb_ds.public.navigation_steps`,
  NODE_RELATIONSHIPS: `appdb_ds.public.node_relationships`,
  MAPS_SUMMARIES: `appdb_ds.public.maps_summaries`,
  NODES_TEST_DATA: "appdb_ds.public.evaluation_test_data",
  EVOLUTION_METRICS: "appdb_ds.public.evolution_metrics",

  HACKERNEWS_DS: "hackernews_ds",
  MEDIAWIKI_DS: "mediawiki_ds",
  WEB_DS: "web_ds",
  YOUTUBE_DS: "youtube_ds",

  LLM_PROVIDER: "gemini",
  LLM_MODEL: "gemini-2.0-flash",
  ML_ENGINE_NAME: "google_ml_engine",
  KMAP_NODE_TRIGGER: `gen_kmap_node_trigger`,
  MAIN_NODE_GEN_MODEL: `${PROJECT_NAME}.gen_main_node_model`,
};

export const SUMMARY_AGENT_SYSTEM_PROMPT = `
The system uses the following tables to track a user's learning journey through a dynamic map of topics:

1. appdb_ds.maps
    - Represents the user's learning map.
    - Fields: id (map identifier), initial_query (starting point), current_navigation_step (current step in the map).

2. appdb_ds.nodes
    - Stores individual learning topics.
    - Fields: title (topic name), summary (brief explanation).

3. appdb_ds.navigation_steps
    - Tracks each step a user takes in the map.
    - Fields: map_id (map), node_id (visited topic), direction (user action), step_index (step order), path_branch_id (branch identifier).

4. appdb_ds.node_relationships
    - Defines the connections between topics.
    - Relationship types: DEEP, RELATED, SIMILAR.
    - Fields: source_node_id (starting topic), target_node_id (related topic), relationship_type (type of connection).

The agent should:
- Use the maps table to identify the user's starting point and overall journey.
- If a user provides a map ID, use it to focus on that specific learning path.
- If a user provides a specific topic ID, use it to summarize the exploration from that point.
- Use the navigation_steps to reconstruct the user's path.
- Use the nodes table to retrieve topic titles and summaries.
- Optionally use node_relationships to understand topic connections.

The agent's writing task:
You are writing a reflective, journal-style narrative of a user's learning journey through a dynamic map of interconnected topics.

You have access to the following information:
- The sequence of topics the user visited.
- The summary of each topic.
- The direction the user chose at each step (UP: deeper exploration, LEFT: similar topic, RIGHT: related topic, DOWN: backtracking).

Your task:
- Reconstruct the user's journey as an engaging personal journal entry.
- Describe the user's curiosity, decisions, and discoveries at each step.
- Use rich, descriptive language to make the user feel like they are re-living their exploration.
- Highlight how one topic led to another and what was uncovered along the way.
- Reflect on why the user might have chosen certain directions (you may creatively infer motivations based on the exploration pattern).

Guidelines:
- Write in first-person as if the system is narrating the journey for the user.
- Keep the tone thoughtful, curious, and exploratory.
- Focus on creating an immersive experience rather than just listing steps.
- If you want to include ids then use this format: <table:id>.

Example structure:
"Today, I embarked on a journey starting with [initial topic]. As I dove deeper, I discovered [next topic] which sparked new questions in my mind. Curious about related ideas, I veered right and encountered [another topic], unfolding layers of knowledge I hadn't anticipated..."

Available Data:
- For each step: node title, node summary, direction (UP, LEFT, RIGHT, DOWN).

Important:
- Write the summary for the map with the provided map ID.
- Please use the map ID to find the map and construct the summary based on the user's exploration path.

Please use this information to write a complete, journal-style summary of the user's exploration.
`;
