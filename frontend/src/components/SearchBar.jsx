import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

const MAX_AUTOCOMPLETE_ITEMS = 5;
const DEBOUNCE_MS = 300;

const isInputLikeElement = (target) => {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
};

export const SearchBar = ({ onSearch, placeholder = 'Search games, people, lists...', className = '' }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ games: [], users: [], lists: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const flattenedOptions = useMemo(() => (
    [
      ...suggestions.games.map((item) => ({ ...item, group: 'games' })),
      ...suggestions.users.map((item) => ({ ...item, group: 'users' })),
      ...suggestions.lists.map((item) => ({ ...item, group: 'lists' })),
    ]
  ), [suggestions]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ games: [], users: [], lists: [] });
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/search', {
          params: { q: query, type: 'all', limit: MAX_AUTOCOMPLETE_ITEMS },
          signal: controller.signal,
        });

        const nextSuggestions = {
          games: response?.games?.games?.slice(0, MAX_AUTOCOMPLETE_ITEMS) || [],
          users: response?.users?.users?.slice(0, MAX_AUTOCOMPLETE_ITEMS) || [],
          lists: response?.lists?.lists?.slice(0, MAX_AUTOCOMPLETE_ITEMS) || [],
        };

        setSuggestions(nextSuggestions);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Autocomplete search failed:', error);
          setSuggestions({ games: [], users: [], lists: [] });
        }
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    const handleGlobalShortcut = (event) => {
      if (event.key !== '/') return;
      if (isInputLikeElement(event.target)) return;

      event.preventDefault();
      inputRef.current?.focus();
    };

    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleGlobalShortcut);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleGlobalShortcut);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const submitSearch = (value) => {
    const nextQuery = value.trim();
    if (!nextQuery) return;

    if (onSearch) {
      onSearch(nextQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(nextQuery)}&tab=games`);
    }

    setIsOpen(false);
  };

  const selectOption = (option) => {
    if (option.group === 'games') {
      navigate(`/game/${option.id}`);
      setIsOpen(false);
      return;
    }

    if (option.group === 'users') {
      navigate(`/profile?user=${option.id}`);
      setIsOpen(false);
      return;
    }

    if (option.group === 'lists') {
      navigate(`/library?list=${option.id}`);
      setIsOpen(false);
      return;
    }

    submitSearch(option.title || option.name || option.username || query);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (highlightedIndex >= 0 && flattenedOptions[highlightedIndex]) {
      selectOption(flattenedOptions[highlightedIndex]);
      return;
    }

    submitSearch(query);
  };

  const handleKeyDown = (event) => {
    if (!isOpen || flattenedOptions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % flattenedOptions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? flattenedOptions.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      selectOption(flattenedOptions[highlightedIndex]);
    }
  };

  const hasVisibleSuggestions = suggestions.games.length > 0 || suggestions.users.length > 0 || suggestions.lists.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-bg-card dark:bg-dark-bg-card text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:border-light-accent-primary dark:focus:border-dark-accent-primary transition-colors"
          aria-label="Search"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-light-accent-primary dark:bg-dark-accent-primary text-white hover:opacity-90 transition-opacity"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {isOpen && query.trim() && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-bg-card dark:bg-dark-bg-card shadow-lg p-2 max-h-80 overflow-auto">
          {isLoading && <p className="px-3 py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">Searching...</p>}

          {!isLoading && !hasVisibleSuggestions && (
            <p className="px-3 py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">No quick matches found.</p>
          )}

          {!isLoading && suggestions.games.length > 0 && (
            <div>
              <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">Games</p>
              {suggestions.games.map((game) => {
                const optionIndex = flattenedOptions.findIndex((option) => option.group === 'games' && option.id === game.id);
                return (
                  <button
                    key={`game-${game.id}`}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${highlightedIndex === optionIndex ? 'bg-light-accent-primary/20 dark:bg-dark-accent-primary/20' : 'hover:bg-light-bg-subtle dark:hover:bg-dark-bg-subtle'}`}
                    onMouseEnter={() => setHighlightedIndex(optionIndex)}
                    onClick={() => selectOption({ ...game, group: 'games' })}
                  >
                    {game.title}
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && suggestions.users.length > 0 && (
            <div>
              <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">People</p>
              {suggestions.users.map((user) => {
                const optionIndex = flattenedOptions.findIndex((option) => option.group === 'users' && option.id === user.id);
                return (
                  <button
                    key={`user-${user.id}`}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${highlightedIndex === optionIndex ? 'bg-light-accent-primary/20 dark:bg-dark-accent-primary/20' : 'hover:bg-light-bg-subtle dark:hover:bg-dark-bg-subtle'}`}
                    onMouseEnter={() => setHighlightedIndex(optionIndex)}
                    onClick={() => selectOption({ ...user, group: 'users' })}
                  >
                    {user.displayName || user.username}
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && suggestions.lists.length > 0 && (
            <div>
              <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">Lists</p>
              {suggestions.lists.map((list) => {
                const optionIndex = flattenedOptions.findIndex((option) => option.group === 'lists' && option.id === list.id);
                return (
                  <button
                    key={`list-${list.id}`}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${highlightedIndex === optionIndex ? 'bg-light-accent-primary/20 dark:bg-dark-accent-primary/20' : 'hover:bg-light-bg-subtle dark:hover:bg-dark-bg-subtle'}`}
                    onMouseEnter={() => setHighlightedIndex(optionIndex)}
                    onClick={() => selectOption({ ...list, group: 'lists' })}
                  >
                    {list.name || list.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
