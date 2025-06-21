"use client";

import { Plus, Search, Sparkles, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useGlobal } from "@/store/global-state";
import { sessionHelpers } from "@/lib/session";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const suggestedTopics = [
  "Artificial Intelligence",
  "Quantum Computing",
  "Atom",
  "Space Exploration",
  "Neuroscience",
  "Blockchain",
];

export default function CreateMapInput() {
  const [searchValue, setSearchValue] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { state } = useGlobal();
  const isLoading = state === "loading";

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

  const MIN_SEARCH_LENGTH = 3;

  const handleCreateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim() || isLoading) return;

    if (searchValue.trim().length < MIN_SEARCH_LENGTH) {
      toast(
        `Search term must be at least ${MIN_SEARCH_LENGTH} characters long.`
      );
      return;
    }
    setShowSuggestions(false);
    sessionHelpers.startSearch(searchValue);
  };

  const handleSuggestionClick = (topic: string) => {
    if (isLoading) return;
    setSearchValue(topic);
    setShowSuggestions(false);
    sessionHelpers.startSearch(topic);
  };

  console.log("state", state);
  console.log("isLoading", isLoading);

  return (
    <div className="relative">
      <form onSubmit={handleCreateMap} className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsTyping(true);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setIsTyping(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsTyping(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={
              isLoading
                ? "Creating map..."
                : `Try "${currentSuggestion || suggestedTopics[0]}"`
            }
            className="h-12 pl-9 pr-4 text-base bg-background border-2 border-black
                      relative shadow-sm dark:bg-card
                      after:absolute after:inset-0 after:-z-10 after:translate-x-1
                      after:translate-y-1 after:border-2 after:border-primary
                      after:bg-primary/5 focus:after:translate-x-1.5
                      focus:after:translate-y-1.5 transition-all"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!searchValue.trim() || isLoading}
          variant="default"
          size="lg"
          className="h-12 px-4 flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Map
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 py-2 bg-background border-2
                      border-black rounded-lg shadow-sm dark:bg-card
                      after:absolute after:inset-0 after:-z-10 after:border-primary
                      after:bg-primary/5 z-50"
          >
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Suggested Topics
              </div>
              <div className="space-y-1">
                {suggestedTopics.map((topic, i) => (
                  <motion.button
                    key={topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSuggestionClick(topic)}
                    className="w-full px-3 py-2 text-sm text-left rounded-md
                             hover:bg-primary/5 active:bg-primary/10
                             flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {i === 0 && <Sparkles size={12} className="text-primary" />}
                    {topic}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
