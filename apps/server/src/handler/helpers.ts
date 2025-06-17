import { RelationshipType, type Node } from "@kbnet/db";

export const helpers = {
  createContentPrompt(
    relationshipType: RelationshipType,
    parentNode: Node | null
  ): string {
    const baseTopic = parentNode?.title || "the current topic";

    switch (relationshipType) {
      case RelationshipType.DEEP:
        return `Provide a deeper, more detailed exploration of a specific aspect of "${baseTopic}". Focus on technical details, mechanisms, or advanced concepts.`;

      case RelationshipType.RELATED:
        return `Suggest a topic that is related to "${baseTopic}" but explores a different angle or connected concept. Should be in the same domain but distinct.`;

      case RelationshipType.SIMILAR:
        return `Provide an alternative approach, method, or perspective to "${baseTopic}". This could be a competing theory, different methodology, or contrasting viewpoint.`;

      default:
        return `Provide relevant content related to "${baseTopic}".`;
    }
  },
  getSystemPromptForRelationship(relationshipType: RelationshipType): string {
    switch (relationshipType) {
      case RelationshipType.DEEP:
        return "You are an expert educator providing in-depth, detailed explanations of complex topics. Focus on depth, technical accuracy, and comprehensive coverage.";

      case RelationshipType.RELATED:
        return "You are a knowledge connector, helping users discover related topics and concepts. Focus on finding meaningful connections and expanding understanding.";

      case RelationshipType.SIMILAR:
        return "You are a critical thinker presenting alternative viewpoints and approaches. Focus on different perspectives, competing theories, or alternative methods.";

      default:
        return "You are a knowledgeable educator providing clear, informative content.";
    }
  },
};
