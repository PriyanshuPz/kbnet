import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

// TODO: Add prop types or TypeScript types for onSearch
export function SearchBar({ onSearch }: any) {
  const [value, setValue] = useState("");
  const debouncedSearch = useDebounce(onSearch, 500);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-64 md:w-96">
      <Input
        type="text"
        placeholder="Search for knowledge..."
        className="pr-10 focus:ring-2 ring-primary/20"
        value={value}
        onChange={handleChange}
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0 h-full"
        type="submit"
      >
        <Search size={18} />
      </Button>
    </form>
  );
}
