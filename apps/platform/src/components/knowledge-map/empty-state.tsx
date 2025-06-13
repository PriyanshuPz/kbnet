import { useState, useEffect } from "react";
import { Network, Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onReset: () => void;
  onSearch: (query: string) => void;
}

const suggestedTopics = [
  "Artificial Intelligence",
  "Quantum Computing",
  "Climate Science",
  "Space Exploration",
  "Neuroscience",
  "Blockchain",
];

export function EmptyState({ onReset, onSearch }: EmptyStateProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentSuggestion, setCurrentSuggestion] = useState<string>("");
  const [suggestionIndex, setSuggestionIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Auto-rotate through suggested topics for placeholder
  useEffect(() => {
    if (isTyping) return;

    const interval = setInterval(() => {
      const nextIndex = (suggestionIndex + 1) % suggestedTopics.length;
      setSuggestionIndex(nextIndex);
      setCurrentSuggestion(suggestedTopics[nextIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [suggestionIndex, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue);
    }
  };

  const handleSuggestionClick = (topic: string) => {
    setSearchValue(topic);
    onSearch(topic);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <motion.div
        className="flex flex-col items-center gap-6 max-w-md text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Network className="h-16 w-16 text-primary/70" />
        </motion.div>

        <h2 className="text-2xl font-medium">Explore the Knowledge Network</h2>
        <p className="text-sm text-muted-foreground">
          Discover connections between ideas, articles, and concepts
        </p>

        <form onSubmit={handleSubmit} className="w-full relative">
          <div className="relative mt-2 flex items-center">
            <motion.div
              className="absolute left-3 text-muted-foreground"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Search size={18} />
            </motion.div>

            <Input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setIsTyping(true);
              }}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              placeholder={`Try "${currentSuggestion || suggestedTopics[0]}"`}
              className="pl-10 pr-16 py-6 text-lg bg-card/70 border-2 border-primary/20 focus:border-primary/50 transition-all shadow-lg rounded-xl"
            />

            <motion.div
              className="absolute right-3"
              whileHover={{ scale: 1.1 }}
            >
              <Button
                type="submit"
                size="icon"
                disabled={!searchValue.trim()}
                className="bg-primary rounded-lg shadow-md"
              >
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {suggestedTopics.slice(0, 5).map((topic, i) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(topic)}
                className="rounded-full bg-secondary/30 hover:bg-secondary/70 text-xs border-primary/10"
              >
                {i === 0 && (
                  <Sparkles size={12} className="mr-1 text-primary" />
                )}
                {topic}
              </Button>
            </motion.div>
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={onReset}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Browse random topics
        </Button>
      </motion.div>
    </div>
  );
}
