import NodeCard from "./node-card";

interface ViewportNodesProps {
  viewportNodes: any;
  directions: any;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
}

export function ViewportNodes({
  viewportNodes,
  directions,
  onNavigate,
}: ViewportNodesProps) {
  return (
    <>
      {/* {viewportNodes.up && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-5">
          <NodeCard
            node={viewportNodes.up}
            relationshipType="DEEP"
            variant="preview"
            direction="up"
            onClick={() => onNavigate("up")}
          />
        </div>
      )} */}

      {/* {viewportNodes.down && directions.down && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-5">
          <NodeCard
            node={viewportNodes.down}
            relationshipType="PARENT"
            variant="preview"
            direction="down"
            isBackDirection={directions.backDirection === "down"}
            onClick={() => onNavigate("down")}
          />
        </div>
      )} */}

      {viewportNodes.left && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-5">
          <NodeCard
            node={viewportNodes.left}
            relationshipType={
              directions.backDirection === "left" ? "BACK" : "RELATED"
            }
            variant="preview"
            direction="left"
            isBackDirection={directions.backDirection === "left"}
            onClick={() => onNavigate("left")}
          />
        </div>
      )}

      {viewportNodes.right && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-5">
          <NodeCard
            node={viewportNodes.right}
            relationshipType={
              directions.backDirection === "right" ? "BACK" : "ALTERNATIVE"
            }
            variant="preview"
            direction="right"
            isBackDirection={directions.backDirection === "right"}
            onClick={() => onNavigate("right")}
          />
        </div>
      )}
    </>
  );
}
