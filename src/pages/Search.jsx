import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { setSearchResults } from '../redux/moviesSlice';

export default function Search() {
  const dispatch = useDispatch();
  // Get searchResults (from Redux for previous search results) and addedMovies (manually added)
  // Also get 'movies' which are the API-fetched movies from the Redux store
  const { searchResults, addedMovies, movies: apiMovies } = useSelector(state => state.movies);

  // Combine all movies (API + manually added) for comprehensive suggestions
  // Ensure we don't have duplicates if an API movie was also manually added with the same ID,
  // preferring the manually added one if it matches the ID.
  const allMovies = (() => {
    const combined = [...(apiMovies || [])];
    const uniqueIds = new Set(apiMovies.map(m => m.id));
    for (const addedMovie of (addedMovies || [])) {
      if (!uniqueIds.has(addedMovie.id)) {
        combined.push(addedMovie);
      } else {
        // If an added movie has the same ID as an API movie, replace it (or decide which one to keep)
        // For simplicity, we'll assume addedMovies might have new IDs or unique aspects.
        // If IDs can collide, a more robust de-duplication based on original_id for API movies
        // vs local ID for added movies might be needed. For now, simple ID check.
        const existingIndex = combined.findIndex(m => m.id === addedMovie.id);
        if (existingIndex !== -1) {
          combined[existingIndex] = addedMovie; // Replace API movie with added movie if ID is same
        }
      }
    }
    return combined;
  })();


  const [query, setQuery] = useState("");
  const [exactYear, setExactYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // New state for title suggestions

  // Load the list of genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
        );
        setGenres(res.data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  // Handler for changes in the main search query input
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery); // Update the query state

    if (newQuery.trim().length > 0) {
      const normalizedQuery = newQuery.trim().toLowerCase();
      // Filter all movies for suggestions where title starts with the query
      const filteredSuggestions = allMovies.filter(movie =>
        movie.title && movie.title.toLowerCase().startsWith(normalizedQuery)
      ).slice(0, 10); // Limit to top 10 suggestions for performance/UI
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]); // Clear suggestions if query is empty
    }
    // Clear search results if query is empty to avoid stale results
    if (newQuery.trim() === "") {
        dispatch(setSearchResults([]));
        setHasSearched(false);
    }
  };

  // Handler for when a suggestion is clicked
  const handleSuggestionClick = (suggestedTitle) => {
    setQuery(suggestedTitle); // Set the query input to the clicked suggestion
    setSuggestions([]); // Clear the suggestions list
    // Optionally, trigger a full search immediately after selecting a suggestion
    // handleSearch(); // Uncomment if you want immediate search on click
  };


  const handleSearch = async () => {
    // Clear suggestions when the main search is performed
    setSuggestions([]);

    // Check if no query and no filters, clear results
    if (!query.trim() && !exactYear && !minRating && selectedGenres.length === 0) {
      dispatch(setSearchResults([]));
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      let apiResults = [];

      // Step 1: Determine the base API call
      if (query.trim()) {
        // If query is present, always start with a search API call
        const searchRes = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${query}`
        );
        apiResults = searchRes.data.results;
      } else if (selectedGenres.length > 0 || exactYear || minRating) {
        // If no query but filters are present, use discover API
        let discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}`;
        
        // Add selected genres (comma-separated for TMDB API's 'OR' logic)
        if (selectedGenres.length > 0) {
          discoverUrl += `&with_genres=${selectedGenres.join(',')}`;
        }
        if (exactYear) {
          discoverUrl += `&primary_release_year=${exactYear}`;
        }
        if (minRating) {
          discoverUrl += `&vote_average.gte=${minRating}`;
        }
        const discoverRes = await axios.get(discoverUrl);
        apiResults = discoverRes.data.results;
      }


      // Combine API results with manually added movies
      // Only include manually added movies if they match the query AND all filters
      let combined = [
        ...addedMovies.filter(m =>
          (query.trim() ? m.title.toLowerCase().includes(query.toLowerCase()) : true) &&
          (exactYear ? (m.release_date && m.release_date.slice(0, 4) === exactYear) : true) &&
          (minRating ? (m.vote_average >= parseFloat(minRating)) : true) &&
          // Check if movie has ANY of the selected genres
          (selectedGenres.length > 0 ? 
              (m.genre_ids && selectedGenres.some(genreId => m.genre_ids.includes(parseInt(genreId)))) : true)
        ),
        ...apiResults
      ];

      // Apply additional filters to API results if a query was used (as search API doesn't support them directly)
      // Note: This filtering applies to `apiResults` *after* they are fetched,
      // and only if a `query` was initially present.
      if (query.trim()) { 
        // Filter by exact year
        if (exactYear) {
          combined = combined.filter(m => 
            m.release_date && m.release_date.slice(0, 4) === exactYear
          );
        }

        // Filter by minimum rating
        if (minRating) {
          combined = combined.filter(m => 
            m.vote_average >= parseFloat(minRating)
          );
        }

        // Filter by selected genres
        if (selectedGenres.length > 0) {
          combined = combined.filter(m => 
            m.genre_ids && selectedGenres.some(genreId => m.genre_ids.includes(parseInt(genreId)))
          );
        }
      }

      // Remove duplicates based on ID (important when combining API and added movies)
      const uniqueMovies = combined.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );

      dispatch(setSearchResults(uniqueMovies));
    } catch (error) {
      console.error('Search error:', error);
      dispatch(setSearchResults([]));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setExactYear("");
    setMinRating("");
    setSelectedGenres([]); // Reset to empty array
    setHasSearched(false);
    setIsLoading(false);
    setSuggestions([]); // Clear suggestions on reset
    dispatch(setSearchResults([]));
  };

  // Ensure results are cleared when all inputs are empty
  useEffect(() => {
    if (query.trim() === "" && !exactYear && !minRating && selectedGenres.length === 0) {
      dispatch(setSearchResults([]));
      setHasSearched(false);
      setIsLoading(false);
    }
  }, [query, exactYear, minRating, selectedGenres]); // Add all filter dependencies here

  // Helper function to handle individual checkbox changes for genres
  const handleGenreCheckboxChange = (e) => {
    const genreId = parseInt(e.target.value); // Ensure genreId is an integer
    const isChecked = e.target.checked;

    setSelectedGenres((prevSelectedGenres) => {
      if (isChecked) {
        // Add genreId if it's not already in the array
        return [...prevSelectedGenres, genreId];
      } else {
        // Remove genreId from the array
        return prevSelectedGenres.filter((id) => id !== genreId);
      }
    });
  };

  return (
    <div className="pt-24 px-4 pb-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating search icons */}
      <div className="absolute top-32 right-20 text-6xl animate-bounce opacity-20 delay-300">🔍</div>
      <div className="absolute top-60 left-20 text-4xl animate-bounce opacity-15 delay-700">🎬</div>
      <div className="absolute bottom-40 right-40 text-5xl animate-bounce opacity-10 delay-1000">🍿</div>
      <div className="absolute bottom-20 left-40 text-3xl animate-bounce opacity-20 delay-500">⭐</div>

      <div className="m-10 w-full max-w-screen-xl mx-auto relative z-10">
        <div className="flex flex-col">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
            
            {/* Main Title with glassmorphism effect */}
            <div className="text-center mb-8">
              <div className="inline-block p-6 rounded-xl backdrop-blur-md bg-slate-800/30 border border-slate-700/50 shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-4xl">🔍</span>
                  <h1 className="text-3xl font-bold text-white">
                    Discover Movies
                  </h1>
                  <span className="text-4xl">🎭</span>
                </div>
                <p className="text-slate-300">
                  Find your next favorite film with advanced filters
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              {/* Main Search Bar and Suggestions */}
              <div className="relative mb-10 w-full">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative flex items-center">
                    <svg 
                      className="absolute left-4 block h-6 w-6 text-purple-400 z-10" 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                      type="text" 
                      name="search" 
                      value={query}
                      onChange={handleQueryChange} // Use the new handler for suggestions
                      className="h-16 w-full cursor-text rounded-xl border border-purple-500/30 bg-gray-800/60 py-4 pr-6 pl-14 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300 text-lg" 
                      placeholder="Search for amazing movies..."
                    />
                  </div>
                </div>

                {/* Suggestions List */}
                {suggestions.length > 0 && query.trim().length > 0 && (
                  <ul className="absolute z-20 w-full bg-gray-700/90 border border-purple-500/30 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-xl backdrop-blur-md">
                    {suggestions.map((movie) => (
                      <li
                        key={movie.id}
                        className="p-3 text-gray-200 hover:bg-purple-700/50 cursor-pointer transition-colors duration-200 border-b border-gray-600/50 last:border-b-0"
                        onClick={() => handleSuggestionClick(movie.title)}
                      >
                        {movie.title} ({movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Filters Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🎛️</span>
                  <h3 className="text-xl font-semibold text-purple-300">Advanced Filters</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {/* Release Year */}
                  <div className="flex flex-col group">
                    <label htmlFor="exactYear" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      Release Year
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="exactYear"
                        value={exactYear}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d{0,4}$/.test(value)) {
                            setExactYear(value);
                          }
                        }}
                        placeholder="e.g. 2023" 
                        className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Minimum Rating */}
                  <div className="flex flex-col group">
                    <label htmlFor="minRating" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      Minimum Rating
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        id="minRating"
                        min="0"
                        max="10"
                        step="0.1"
                        value={minRating}
                        onChange={(e) => setMinRating(e.target.value)}
                        placeholder="e.g. 7.5" 
                        className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Genre - REPLACED WITH CHECKBOXES */}
                  <div className="flex flex-col group lg:col-span-3"> {/* Span full width for better layout */}
                    <label className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🎪</span>
                      Select Genres
                    </label>
                    <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 p-4 shadow-lg h-48 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {genres.map((genre) => (
                          <div key={genre.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`genre-${genre.id}`}
                              value={genre.id}
                              checked={selectedGenres.includes(genre.id)} // Check if genre.id (number) is in selectedGenres (array of numbers)
                              onChange={handleGenreCheckboxChange}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700 cursor-pointer"
                            />
                            <label htmlFor={`genre-${genre.id}`} className="ml-2 text-sm text-gray-200 cursor-pointer">
                              {genre.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button 
                  type="button"
                  onClick={handleReset}
                  className="group relative px-8 py-3 rounded-xl bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-600/50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    Reset Filters
                  </span>
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-purple-500/25 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">🔍</span>
                        Search Movies
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto mt-12 px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-500 absolute top-0 left-0"></div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Searching the cinema universe...</h3>
              <p className="text-gray-400">Finding the perfect movies for you</p>
            </div>
          </div>
        ) : hasSearched && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="text-8xl animate-pulse opacity-60">🎬</div>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce">❓</div>
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-bold text-white mb-4">No Movies Found</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                We couldn't find any movies matching your search criteria. Try adjusting your filters or search terms to discover amazing films.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">💡 Try broader terms</span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">🎯 Check your filters</span>
                <span className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full text-sm">✨ Explore genres</span>
              </div>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-block p-4 rounded-xl backdrop-blur-md bg-slate-800/30 border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-2">
                  🎭 Found {searchResults.length} Movies
                </h2>
                <p className="text-slate-300">Your cinematic journey awaits</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {searchResults.map((movie) => (
                <div key={movie.id} className="transform hover:scale-105 transition-all duration-300">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
