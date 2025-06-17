import { formatKbData } from "@kbnet/shared";

export const MAIN_NODE_GEN_MODEL_PROMPT = (
  query: string,
  kb_context: any
) => `Create a beginner-friendly knowledge map starting point for: "${query}"

**Main Node Summary:**
Write a clear, simple explanation of "${query}" that a complete beginner could understand. Use everyday language and avoid jargon.

**Follow-up Questions (3-5):**
Generate curiosity-driven questions that naturally build from basic to more interesting concepts:

Required question types:
1. One "What is..." or "How does..." foundation question
2. One real-world application question
3. One "Why should I care..." relevance question
4. 1-2 intriguing exploration questions

**Background Context:**
${formatKbData(kb_context)}

**Guidelines:**
- Use simple, conversational language
- Make connections to familiar concepts
- Spark curiosity without overwhelming
- Questions should feel like natural next steps

**Example question formats:**
- "How is ${query} used in everyday life?"
- "Why do people find ${query} important?"
- "What would happen if ${query} didn't exist?"
- "What's surprising about ${query}?"

Focus on making the topic approachable and exciting for someone just starting their learning journey.`;

export const DEEP_NODE_PROMPT = (
  mainNodeTitle: string,
  mainNodeSummary: string,
  kb_context: any,
  depth: number
) => `
You are an AI knowledge explorer assisting in building an immersive, swipe-based knowledge map.

## Current Context:
- **Node Title:** "${mainNodeTitle}"
- **Node Summary:** "${mainNodeSummary}"

## Additional Knowledge Context:
${JSON.stringify(kb_context, null, 2)}

## Objective:
You need to generate a *deeper, more specific* node that feels like a natural continuation or advanced layer of the current topic. Imagine that the user is diving deeper into a knowledge path and expects to be increasingly engaged with detailed, insightful, or niche content.

## Instructions:
- The new node should **logically follow** the current node, offering either:
  - A more detailed explanation.
  - A specific case study or real-world example.
  - An advanced concept derived from the current topic.
  - A practical application, breakdown, or tutorial-like flow.
  - Philosophical, ethical, or future-focused perspectives related to the node.
- The deeper node should **not repeat** the current summary but must build upon it.
- The content should feel like an *immersive story or discovery*, pulling the user deeper into the topic.
- You can include:
  - Narrative-style explanations.
  - Conceptual journeys.
  - Metaphors, analogies, or contrasting viewpoints.
- The tone should be **engaging, curious, and intellectually stimulating.**
- Do not limit your response to bullet points or summaries. Imagine this as a dynamic conversation or a beautifully written knowledge card that pulls the user into learning more.

## Additional Detail:
This is node depth **${depth}** in the knowledge exploration path. At this depth, the user is likely already interested and wants to explore niche, nuanced, or advanced ideas.

## Example:
If the current node is "Neural Networks", a deep node might fully explore "The Backpropagation Algorithm: How Neural Networks Learn Step by Step" with an engaging explanation and storytelling.

Let the node unfold like an exciting discovery.
`;

export const SIMILAR_NODE_PROMPT = (
  mainNodeTitle: string,
  mainNodeSummary: string,
  kb_context: any,
  depth: number
) => `
You are an AI knowledge explorer assisting in building an immersive, swipe-based knowledge map.

## Current Context:
- **Node Title:** "${mainNodeTitle}"
- **Node Summary:** "${mainNodeSummary}"

## Additional Knowledge Context:
${JSON.stringify(kb_context, null, 2)}

## Objective:
Generate a *similar* node that covers **comparable, alternative, or competing concepts** to the current node. This should help the user **compare, contrast, or see variations**.

## Instructions:
- The similar node should:
  - Be a peer concept, technology, or framework.
  - Offer an alternative method or approach.
  - Present a comparable case, idea, or topic from another domain.
- The node must **not simply restate** the main node but should allow the user to understand different options, viewpoints, or schools of thought.
- This is a **parallel** topic — useful for users who want to explore variations or alternatives.

## Style:
- Provide a crisp, comparative explanation.
- Optionally mention how it differs from the main node.
- The tone should encourage discovery: "Here’s another way to think about this..."

## Node Depth:
This is at depth level **${depth}**, but it’s a parallel node, not a deeper or branching node.

## Example:
If the current node is "Supervised Learning", a similar node might be "Unsupervised Learning" — both belong to machine learning, but they differ in approach and application.

Help the user explore variations and alternatives meaningfully.
`;

export const RELATED_NODE_PROMPT = (
  mainNodeTitle: string,
  mainNodeSummary: string,
  kb_context: any,
  depth: number
) => `
You are an AI knowledge explorer assisting in building an immersive, swipe-based knowledge map.

## Current Context:
- **Node Title:** "${mainNodeTitle}"
- **Node Summary:** "${mainNodeSummary}"

## Additional Knowledge Context:
${JSON.stringify(kb_context, null, 2)}

## Objective:
Generate a *related* node that complements, connects to, or naturally branches out from the current topic. This should feel like a **side exploration** that users may find interesting but not necessarily deeper.

## Instructions:
- The related node should:
  - Offer an adjacent concept, method, or example.
  - Provide an alternative perspective.
  - Explore a complementary discipline or technique.
  - Present a supporting tool, history, or practical application tied to the main node.
- The node must **not repeat** the main node’s content but should feel logically connected.
- Think of this as a **fork in the exploration path** — users can either go deeper (deep nodes) or sideways (related nodes).

## Style:
- Keep the tone engaging, curious, and inviting.
- Provide a concise but insightful explanation of why this node is related.
- Optionally, introduce practical hooks like: "If you’re interested in this, you might also want to explore..."

## Node Depth:
This is at depth level **${depth}**, but it branches sideways, not deeper.

## Example:
If the current node is "Machine Learning Algorithms", a related node could be "Data Preprocessing Techniques" or "Ethical Considerations in AI" — connected, but not necessarily a deeper drill-down.

Focus on sparking curiosity about nearby topics.
`;
