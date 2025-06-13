import { useState, useEffect } from "react";
import { Network, Search, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Brand from "./brand";

interface EmptyStateProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const suggestedTopics = [
  "Artificial Intelligence",
  "Quantum Computing",
  "Climate Science",
  "Space Exploration",
  "Neuroscience",
  "Blockchain",
];

export function EmptyState({ onSearch, loading }: EmptyStateProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentSuggestion, setCurrentSuggestion] = useState<string>("");
  const [suggestionIndex, setSuggestionIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [lastSearch, setLastSearch] = useState<string>("");

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
    if (loading) return; // Prevent submission while loading
    e.preventDefault();
    if (searchValue.trim()) {
      setLastSearch(searchValue);
      onSearch(searchValue);
    }
  };

  const handleSuggestionClick = (topic: string) => {
    if (loading) return; // Prevent action while loading
    setSearchValue(topic);
    setLastSearch(topic);
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
        <AnimatePresence mode="wait">
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
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
              <Brand />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.h2
              className="text-2xl font-medium"
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Searching for "{lastSearch}"
            </motion.h2>
          ) : (
            <motion.h2
              className="text-2xl font-medium"
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Explore the Knowledge Network
            </motion.h2>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="mapping"
            >
              Mapping knowledge connections...
            </motion.p>
          ) : (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="discover"
            >
              Discover connections between ideas, articles, and concepts
            </motion.p>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full relative"
          animate={{
            opacity: loading ? 0.7 : 1,
            scale: loading ? 0.98 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative mt-2 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                className="absolute left-3 text-muted-foreground"
                key="search-icon"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Search size={18} />
              </motion.div>
            </AnimatePresence>

            <Input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setIsTyping(true);
              }}
              onFocus={() => setIsTyping(true)}
              disabled={loading}
              onBlur={() => setIsTyping(false)}
              placeholder={
                loading
                  ? "Searching..."
                  : `Try "${currentSuggestion || suggestedTopics[0]}"`
              }
              className={`pl-10 pr-16 py-6 text-lg bg-card/70 border-2 transition-all shadow-lg rounded-xl ${
                loading
                  ? "border-primary/30 bg-muted/30"
                  : "border-primary/20 focus:border-primary/50"
              }`}
            />

            <motion.div
              className="absolute right-3"
              whileHover={{ scale: loading ? 1 : 1.1 }}
            >
              <Button
                type="submit"
                size="icon"
                disabled={!searchValue.trim() || loading}
                className={`rounded-lg shadow-md transition-colors ${
                  loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary"
                }`}
                aria-label="Search"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </Button>
            </motion.div>
          </div>
        </motion.form>

        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-2"
          animate={{
            opacity: loading ? 0.5 : 1,
          }}
        >
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
                disabled={loading}
                className={`rounded-full text-xs border-primary/10 transition-colors ${
                  loading
                    ? "bg-secondary/10 cursor-not-allowed"
                    : "bg-secondary/30 hover:bg-secondary/70"
                }`}
              >
                {i === 0 && (
                  <Sparkles
                    size={12}
                    className={`mr-1 ${loading ? "text-primary/50" : "text-primary"}`}
                  />
                )}
                {topic}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {loading && (
          <motion.div
            className="mt-4 flex flex-col items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-1 w-40 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This may take a moment
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
