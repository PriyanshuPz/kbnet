interface NavigationHintsProps {
  backDirection: string | null;
  currentDepth: number;
}

export function NavigationHints({
  backDirection,
  currentDepth,
}: NavigationHintsProps) {
  const getBackHint = () => {
    switch (backDirection) {
      case "down":
        return "↑ Swipe Up/W to go Back";
      case "left":
        return "→ Swipe Right/D to go Back";
      case "right":
        return "← Swipe Left/A to go Back";
      case "up":
        return "↓ Swipe Down/S to go Back";
      default:
        return currentDepth === 0 ? "Root level" : "";
    }
  };

  return (
    <div className="absolute bottom-4 left-4 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded p-2 border">
      <p className="font-semibold mb-1">Navigate (Inverted):</p>
      <p>↓ Swipe Down/S for Deeper</p>
      {backDirection && (
        <p className="text-yellow-600 font-medium">{getBackHint()}</p>
      )}
      {backDirection !== "left" && <p>→ Swipe Right/D for Related</p>}
      {backDirection !== "right" && <p>← Swipe Left/A for Alternative</p>}
      {backDirection !== "down" && currentDepth > 0 && (
        <p>↑ Swipe Up/W for Parent</p>
      )}
    </div>
  );
}
