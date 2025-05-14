import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // This would be replaced with a real query to get suggestions
  const { data: suggestions } = useQuery<string[]>({
    queryKey: ['/api/search/suggestions', searchQuery],
    enabled: searchQuery.length > 2,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      setSuggestionsVisible(true);
    } else {
      setSuggestionsVisible(false);
    }
  };

  const performSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestionsVisible(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setSuggestionsVisible(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setSuggestionsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full md:max-w-2xl">
      <div className="flex items-center border-2 rounded-full border-primary focus-within:shadow-lg search-animation overflow-hidden">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search for any product in the world..." 
          className="w-full py-3 px-6 focus:outline-none"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="bg-primary text-white px-6 py-3 h-full flex items-center justify-center"
          onClick={performSearch}
        >
          <i className="ri-search-line text-xl"></i>
        </button>
      </div>
      
      {suggestionsVisible && suggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full mt-2 left-0 right-0 bg-white shadow-lg rounded-lg z-10"
        >
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <i className="ri-history-line mr-2 text-gray-mid"></i>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
