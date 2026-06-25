import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SearchBarProps {
  onSearch: (value: string, type: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Verify phone number, bank account, username, or business...",
  className = "",
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [type, setType] = useState("PHONE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSearch(value.trim(), type);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 w-full ${className}`}
    >
      <div className="flex-1 flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <option value="PHONE">Phone</option>
          <option value="BANK">Bank</option>
          <option value="USERNAME">Username</option>
          <option value="BUSINESS">Business</option>
        </select>
        
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
      </div>
      
      <Button
        type="submit"
        isLoading={isLoading}
        disabled={!value.trim()}
        className="sm:w-32 h-[46px] rounded-xl"
      >
        Verify
      </Button>
    </form>
  );
}
