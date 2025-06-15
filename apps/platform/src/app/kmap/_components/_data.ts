// Updated demo data using the new schema
const demoData: KMapNode = {
  id: "root-node",
  kmapId: "map-1",
  label: "Machine Learning",
  content:
    "The study of algorithms that improve automatically through experience.",
  source: "Wikipedia",
  depth: 0,
  createdAt: new Date(),

  deepNode: {
    id: "deep-learning",
    kmapId: "map-1",
    label: "Deep Learning",
    content:
      "A subset of machine learning based on artificial neural networks with representation learning.",
    source: "Research Paper",
    depth: 1,
    createdAt: new Date(),

    deepNode: {
      id: "cnn",
      kmapId: "map-1",
      label: "Convolutional Neural Networks",
      content:
        "Specialized deep neural networks for processing structured grid data like images.",
      source: "AI Textbook",
      depth: 2,
      createdAt: new Date(),
    },
    deepNodeId: "cnn",

    connectedNodeA: {
      id: "transformers",
      kmapId: "map-1",
      label: "Transformer Models",
      content:
        "Neural network architecture using self-attention mechanisms for sequential data.",
      source: "Research Paper",
      depth: 1,
      createdAt: new Date(),
    },
    connectedNodeAId: "transformers",

    connectedNodeB: {
      id: "symbolic-ai",
      kmapId: "map-1",
      label: "Symbolic AI Approach",
      content:
        "An alternative to neural networks using explicit rules and symbolic manipulation.",
      source: "AI History",
      depth: 1,
      createdAt: new Date(),
    },
    connectedNodeBId: "symbolic-ai",
  },
  deepNodeId: "deep-learning",

  connectedNodeA: {
    id: "data-science",
    kmapId: "map-1",
    label: "Data Science",
    content:
      "Interdisciplinary field extracting knowledge from data using scientific methods.",
    source: "Academic Journal",
    depth: 0,
    createdAt: new Date(),
  },
  connectedNodeAId: "data-science",

  connectedNodeB: {
    id: "traditional-algorithms",
    kmapId: "map-1",
    label: "Traditional Algorithms",
    content: "Classic programming approaches without learning capabilities.",
    source: "Computer Science Textbook",
    depth: 0,
    createdAt: new Date(),
  },
  connectedNodeBId: "traditional-algorithms",
};

// Helper function to generate lorem ipsum text
const generateLoremIpsum = (min: number, max: number): string => {
  const lorem = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "At vero eos et accusamus et iusto odio dignissimos ducimus.",
    "Nam libero tempore, cum soluta nobis est eligendi optio cumque.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.",
    "Itaque earum rerum hic tenetur a sapiente delectus.",
    "Et harum quidem rerum facilis est et expedita distinctio.",
  ];

  const sentenceCount = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = "";

  for (let i = 0; i < sentenceCount; i++) {
    const randomIndex = Math.floor(Math.random() * lorem.length);
    result += lorem[randomIndex] + " ";
  }

  return result.trim();
};

// Generate random node title based on topic
const generateNodeTitle = (topic: string): string => {
  const topics = {
    "Machine Learning": [
      "Neural Networks",
      "Decision Trees",
      "Random Forests",
      "Support Vector Machines",
      "K-Means Clustering",
      "Reinforcement Learning",
      "Unsupervised Learning",
      "Transfer Learning",
      "Feature Engineering",
      "Model Optimization",
      "Hyperparameter Tuning",
      "Ensemble Methods",
    ],
    AI: [
      "Natural Language Processing",
      "Computer Vision",
      "Speech Recognition",
      "Expert Systems",
      "Robotics AI",
      "Knowledge Representation",
      "Automated Planning",
      "Multi-agent Systems",
      "Genetic Algorithms",
      "Artificial General Intelligence",
      "Cognitive Computing",
      "Swarm Intelligence",
    ],
    "Data Science": [
      "Data Mining",
      "Statistical Analysis",
      "Big Data",
      "Data Visualization",
      "Predictive Analytics",
      "Time Series Analysis",
      "Data Preprocessing",
      "Feature Selection",
      "Anomaly Detection",
      "Hypothesis Testing",
      "A/B Testing",
      "Regression Analysis",
    ],
    Programming: [
      "Object-Oriented Programming",
      "Functional Programming",
      "Reactive Programming",
      "Concurrent Programming",
      "Imperative Programming",
      "Declarative Programming",
      "Event-Driven Programming",
      "Metaprogramming",
      "Generic Programming",
      "Aspect-Oriented Programming",
      "Logic Programming",
      "Scripting Languages",
    ],
    Database: [
      "SQL Databases",
      "NoSQL Systems",
      "Database Optimization",
      "Data Normalization",
      "Query Processing",
      "Indexing Techniques",
      "Transaction Management",
      "Database Security",
      "Data Warehousing",
      "Distributed Databases",
      "In-Memory Databases",
      "Graph Databases",
    ],
  };

  // Default to AI topics if topic not found
  const topicList = topics[topic as keyof typeof topics] || topics["AI"];
  return topicList[Math.floor(Math.random() * topicList.length)];
};

// Generate random source reference
const generateSource = (): string => {
  const sources = [
    "Wikipedia",
    "Research Paper",
    "Academic Journal",
    "Textbook",
    "Conference Proceedings",
    "Tech Blog",
    "Industry Report",
    "Scientific Publication",
    "University Course",
    "Expert Interview",
    "Survey Results",
    "Case Study",
    "Technical Documentation",
    "Review Article",
    "Annual Report",
    "White Paper",
  ];

  return sources[Math.floor(Math.random() * sources.length)];
};

// Generate a single node with specified properties - updated for new schema
const createNode = (
  id: string,
  kmapId: string,
  label: string,
  depth: number,
  topic: string
): KMapNode => {
  return {
    id,
    kmapId,
    label,
    content: generateLoremIpsum(2, 5),
    source: generateSource(),
    depth,
    createdAt: new Date(),
  };
};

// Updated to use the new schema properties
const generateChildNodes = (
  parent: KMapNode,
  kmapId: string,
  depth: number,
  maxDepth: number,
  baseId: string,
  topic: string,
  visitedIds: Set<string> = new Set()
): KMapNode => {
  // Prevent infinite recursion by tracking visited IDs
  if (visitedIds.has(baseId) || depth >= maxDepth) {
    return parent;
  }

  visitedIds.add(baseId);
  let currentNode = { ...parent };

  // SAFETY CHECK: Absolute maximum depth to prevent stack overflow
  const ABSOLUTE_MAX_DEPTH = 5;
  if (depth >= ABSOLUTE_MAX_DEPTH) {
    return currentNode;
  }

  // Create deepNode (was swipeUp) only if we haven't reached max depth
  if (depth < maxDepth - 1) {
    const deepId = `${baseId}-deep-${depth}`;
    const deepLabel = generateNodeTitle(topic) + Math.random().toFixed(2);
    const deepNode = createNode(deepId, kmapId, deepLabel, depth + 1, topic);

    currentNode.deepNode = generateChildNodes(
      deepNode,
      kmapId,
      depth + 1,
      Math.min(maxDepth, depth + 2), // Limit depth increase
      deepId,
      topic,
      new Set(visitedIds)
    );
    currentNode.deepNodeId = currentNode.deepNode.id;
  }

  // Create connectedNodeA (was swipeRight)
  if (depth < maxDepth - 1) {
    const nodeAId = `${baseId}-nodeA-${depth}`;
    const nodeALabel = generateNodeTitle(topic) + Math.random().toFixed(2);
    const nodeA = createNode(nodeAId, kmapId, nodeALabel, depth, topic);

    currentNode.connectedNodeA = generateChildNodes(
      nodeA,
      kmapId,
      depth,
      Math.min(maxDepth - 1, depth + 2), // Limit related node depth
      nodeAId,
      topic,
      new Set(visitedIds)
    );
    currentNode.connectedNodeAId = currentNode.connectedNodeA.id;
  }

  // Create connectedNodeB (was swipeLeft)
  if (depth < maxDepth - 1) {
    const nodeBId = `${baseId}-nodeB-${depth}`;

    // Choose a different topic for alternative views
    const topics = [
      "Machine Learning",
      "AI",
      "Data Science",
      "Programming",
      "Database",
    ];
    const currentTopicIndex = topics.indexOf(topic);
    const altTopics = topics.filter((_, i) => i !== currentTopicIndex);
    const altTopic = altTopics[Math.floor(Math.random() * altTopics.length)];

    const nodeBLabel = generateNodeTitle(altTopic) + Math.random().toFixed(2);
    const nodeB = createNode(nodeBId, kmapId, nodeBLabel, depth, altTopic);

    currentNode.connectedNodeB = generateChildNodes(
      nodeB,
      kmapId,
      depth,
      Math.min(maxDepth - 1, depth + 2), // Limit alternative node depth
      nodeBId,
      altTopic,
      new Set(visitedIds)
    );
    currentNode.connectedNodeBId = currentNode.connectedNodeB.id;
  }

  return currentNode;
};

// Fixed generateMockKMap function with proper depth limits - updated for new schema
export function generateMockKMap(
  kmapId: string = "auto-gen-map",
  rootTopic: string = "Machine Learning",
  maxDepth: number = 3 // Reduced depth to prevent recursion issues
): KMapNode {
  const rootNode = createNode("root", kmapId, rootTopic, 0, rootTopic);

  // Impose safety limit
  const safeMaxDepth = Math.min(maxDepth, 3);

  try {
    // Build the tree with recursion protection
    return generateChildNodes(
      rootNode,
      kmapId,
      0,
      safeMaxDepth,
      "root",
      rootTopic,
      new Set()
    );
  } catch (e) {
    console.error("Error generating mock data:", e);
    // Return a simple node if generation fails
    return rootNode;
  }
}

// Generate auto mock data with safer depth limits
export const autoGenDemoData = generateMockKMap(
  "auto-map-1",
  "Machine Learning",
  3
);
export const autoGenAIData = generateMockKMap("auto-map-2", "AI", 3);
export const autoGenDataScienceData = generateMockKMap(
  "auto-map-3",
  "Data Science",
  3
);
export const autoGenProgrammingData = generateMockKMap(
  "auto-map-4",
  "Programming",
  3
);

// Simple function to create a flat node structure with connections - updated for new schema
export function generateSimpleConnectedNodes(
  topic: string = "Machine Learning",
  nodeCount: number = 20
): KMapNode {
  // Create a collection of nodes first
  const nodes: KMapNode[] = [];
  const kmapId = `simple-map-${topic.toLowerCase().replace(/\s/g, "-")}`;

  // Generate all nodes first
  for (let i = 0; i < nodeCount; i++) {
    const id = `node-${i}`;
    const label = generateNodeTitle(topic);
    const depth = Math.min(i, 3); // Limit depth to 0-3

    nodes.push(createNode(id, kmapId, label, depth, topic));
  }

  // Now connect the nodes (without circular references)
  for (let i = 0; i < nodes.length; i++) {
    // Add deepNode connection (to a node with higher depth if possible)
    if (i < nodes.length - 1) {
      nodes[i].deepNode = nodes[i + 1];
      nodes[i].deepNodeId = nodes[i + 1].id;
    }

    // Add connectedNodeA connection (to a node at same depth if possible)
    const nodeAIndex = (i + 3) % nodes.length;
    if (nodeAIndex !== i) {
      nodes[i].connectedNodeA = nodes[nodeAIndex];
      nodes[i].connectedNodeAId = nodes[nodeAIndex].id;
    }

    // Add connectedNodeB connection (to a node at different depth if possible)
    const nodeBIndex = (i + 7) % nodes.length;
    if (nodeBIndex !== i && nodeBIndex !== nodeAIndex) {
      nodes[i].connectedNodeB = nodes[nodeBIndex];
      nodes[i].connectedNodeBId = nodes[nodeBIndex].id;
    }
  }

  return nodes[0]; // Return the root node
}

// Generate simple connected node structures as an alternative
export const simpleMLData = generateSimpleConnectedNodes(
  "Machine Learning",
  30
);
export const simpleAIData = generateSimpleConnectedNodes("AI", 30);
export const simpleDataScienceData = generateSimpleConnectedNodes(
  "Data Science",
  30
);

// Export both original and auto-generated data
export { demoData };
