import React, { useRef, useEffect } from "react";
import { SearchIcon, X } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({ query, setQuery, onSearch }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current.focus(); // mbaj cursorin pas clear
  };

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      {query && (
        <button onClick={handleClear}>
          <X />
        </button>
      )}
      <button type="button" onClick={() => onSearch?.(query)}>
        <SearchIcon />
      </button>
    </div>
  );
}
