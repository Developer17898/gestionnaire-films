import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { setSearchResults } from '../redux/moviesSlice';

export default function Search() {
  const dispatch = useDispatch();
  const { searchResults, addedMovies } = useSelector(state => state.movies);
  const [query, setQuery] = useState("");
  const [exactYear, setExactYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger la liste des genres au montage du composant
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

  const handleSearch = async () => {
    if (!query.trim()) {
      dispatch(setSearchResults([]));
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${query}`;
      
      // Si un genre est sélectionné, utiliser discover au lieu de search
      if (selectedGenre) {
        searchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${selectedGenre}`;
        
        // Ajouter les autres filtres à l'URL discover
        if (exactYear) {
          searchUrl += `&year=${exactYear}`;
        }
        if (minRating) {
          searchUrl += `&vote_average.gte=${minRating}`;
        }
      }

      const res = await axios.get(searchUrl);

      let combined = [
        ...addedMovies.filter(m =>
          m.title.toLowerCase().includes(query.toLowerCase())
        ),
        ...res.data.results
      ];

      // Appliquer les filtres manuellement si on utilise search (pas discover)
      if (!selectedGenre) {
        // Filtrer par année exacte
        if (exactYear) {
          combined = combined.filter(m => 
            m.release_date && m.release_date.slice(0, 4) === exactYear
          );
        }

        // Filtrer par note minimale
        if (minRating) {
          combined = combined.filter(m => 
            m.vote_average >= parseFloat(minRating)
          );
        }
      }

      // Filtrer par genre si sélectionné (pour les films ajoutés manuellement)
      if (selectedGenre && addedMovies.length > 0) {
        const genreId = parseInt(selectedGenre);
        combined = combined.filter(m => 
          !addedMovies.includes(m) || (m.genre_ids && m.genre_ids.includes(genreId))
        );
      }

      // Supprimer les doublons basés sur l'ID
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
    setSelectedGenre("");
    setHasSearched(false);
    setIsLoading(false);
    dispatch(setSearchResults([]));
  };

  useEffect(() => {
    if (query.trim() === "") {
      dispatch(setSearchResults([]));
      setHasSearched(false);
      setIsLoading(false);
    }
  }, [query]);

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
            
            {/* Titre principal avec glassmorphism effect */}
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
              {/* Barre de recherche principale avec style amélioré */}
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
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 w-full cursor-text rounded-xl border border-purple-500/30 bg-gray-800/60 py-4 pr-6 pl-14 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300 text-lg" 
                      placeholder="Search for amazing movies..."
                    />
                  </div>
                </div>
              </div>

              {/* Section des filtres avec style amélioré */}
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

                  {/* Genre */}
                  <div className="flex flex-col group">
                    <label htmlFor="genre" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">🎪</span>
                      Genre
                    </label>
                    <div className="relative">
                      <select 
                        id="genre"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white transition-all duration-300 cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-gray-800 text-white">All Genres</option>
                        {genres.map((genre) => (
                          <option key={genre.id} value={genre.id} className="bg-gray-800 text-white">
                            {genre.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action avec style amélioré */}
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

      {/* Results Section avec style amélioré */}
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