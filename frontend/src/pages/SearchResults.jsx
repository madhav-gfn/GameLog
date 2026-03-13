import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { api } from '../api/axios';
import { gameApi } from '../api/gameApi';

const TABS = ['games', 'people', 'lists', 'tags'];

export const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = (searchParams.get('q') || '').trim();
  const selectedTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'games';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ games: [], users: [], lists: [], tags: [] });
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) {
        setResults({ games: [], users: [], lists: [], tags: [] });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/search', {
          params: { q: query, type: 'all', limit: 50 },
        });

        setResults({
          games: response?.games?.games || [],
          users: response?.users?.users || [],
          lists: Array.isArray(response?.lists) ? response.lists : [],
          tags: Array.isArray(response?.tags) ? response.tags : [],
        });
      } catch (requestError) {
        console.error('Failed to load search results:', requestError);
        setError('Could not load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [query]);

  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const [genreResponse, platformResponse] = await Promise.all([
          gameApi.getGenres(),
          gameApi.getPlatforms(),
        ]);

        setGenres(genreResponse?.genres || []);
        setPlatforms(platformResponse?.platforms || []);
      } catch (metadataError) {
        console.warn('Could not load discover filter metadata:', metadataError);
      }
    };

    fetchFilterMetadata();
  }, []);

  const yearOptions = useMemo(() => {
    const years = new Set(results.games.map((game) => game.releaseYear).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [results.games]);

  const filteredGames = useMemo(() => {
    return results.games.filter((game) => {
      const matchesGenre = !selectedGenre || game.genres?.includes(selectedGenre);
      const matchesPlatform = !selectedPlatform || game.platforms?.includes(selectedPlatform);
      const matchesYear = !selectedYear || String(game.releaseYear) === selectedYear;
      const matchesRating = !selectedRating || Number(game.averageRating || 0) >= Number(selectedRating);
      return matchesGenre && matchesPlatform && matchesYear && matchesRating;
    });
  }, [results.games, selectedGenre, selectedPlatform, selectedYear, selectedRating]);

  const visibleResults = {
    games: filteredGames,
    people: results.users,
    lists: results.lists,
    tags: results.tags,
  };

  const openTab = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  return (
    <div>
      <Header title="Search" subtitle={query ? `Results for “${query}”` : 'Find games, people, lists, and tags'} />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => openTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
              selectedTab === tab
                ? 'bg-primary text-navy'
                : 'bg-navy border-2 border-graphite text-white hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-navy border-2 border-graphite rounded-lg p-4 h-fit space-y-4">
          <h2 className="text-white font-bold uppercase tracking-wider">Filters</h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Reused discover filters for game results</p>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Genre</label>
            <select value={selectedGenre} onChange={(event) => setSelectedGenre(event.target.value)} className="w-full px-3 py-2 bg-background-dark border border-graphite rounded text-white text-sm" disabled={selectedTab !== 'games'}>
              <option value="">All genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>{genre.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Platform</label>
            <select value={selectedPlatform} onChange={(event) => setSelectedPlatform(event.target.value)} className="w-full px-3 py-2 bg-background-dark border border-graphite rounded text-white text-sm" disabled={selectedTab !== 'games'}>
              <option value="">All platforms</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.name}>{platform.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Year</label>
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="w-full px-3 py-2 bg-background-dark border border-graphite rounded text-white text-sm" disabled={selectedTab !== 'games'}>
              <option value="">Any year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Min rating</label>
            <select value={selectedRating} onChange={(event) => setSelectedRating(event.target.value)} className="w-full px-3 py-2 bg-background-dark border border-graphite rounded text-white text-sm" disabled={selectedTab !== 'games'}>
              <option value="">Any rating</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </aside>

        <section>
          {error && <div className="mb-4 rounded border border-crimson bg-crimson/10 px-4 py-3 text-sm text-crimson">{error}</div>}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <LoadingSkeleton count={6} />
            </div>
          )}

          {!loading && selectedTab === 'games' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleResults.games.map((game) => (
                <GameCard key={game.id} game={game} onClick={() => navigate(`/game/${game.id}`)} />
              ))}
              {visibleResults.games.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-10">No games found for this query and filter combination.</div>
              )}
            </div>
          )}

          {!loading && selectedTab === 'people' && (
            <div className="space-y-3">
              {visibleResults.people.map((person) => (
                <button key={person.id} type="button" className="w-full text-left bg-navy border-2 border-graphite rounded-lg p-4 hover:border-primary transition-colors" onClick={() => navigate(`/profile?user=${person.id}`)}>
                  <p className="font-bold text-white">{person.displayName || person.username}</p>
                  <p className="text-sm text-gray-400">@{person.username}</p>
                </button>
              ))}
              {visibleResults.people.length === 0 && <p className="text-gray-400">No people matched this query.</p>}
            </div>
          )}

          {!loading && selectedTab === 'lists' && (
            <div className="space-y-3">
              {visibleResults.lists.length === 0 ? (
                <p className="text-gray-400">List search endpoint is not available yet, so no list results can be shown.</p>
              ) : (
                visibleResults.lists.map((list) => (
                  <div key={list.id} className="bg-navy border-2 border-graphite rounded-lg p-4">
                    <p className="font-bold text-white">{list.name}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && selectedTab === 'tags' && (
            <div className="space-y-3">
              {visibleResults.tags.length === 0 ? (
                <p className="text-gray-400">Tag search endpoint is not available yet, so no tag results can be shown.</p>
              ) : (
                visibleResults.tags.map((tag) => (
                  <div key={tag.id || tag.name} className="inline-flex bg-graphite text-white px-3 py-2 rounded-full mr-2">#{tag.name || tag}</div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
