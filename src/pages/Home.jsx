import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';
import { fetchMovies } from '../redux/moviesSlice';

export default function Home() {
  const dispatch = useDispatch();
  // Retrieve API movies and manually added movies from the Redux store
  const { movies: apiMovies, addedMovies, status, error } = useSelector(state => state.movies);

  // Combine all movies for display (API movies + manually added movies)
  // Reverse addedMovies so the most recent is first in the display
  const allAvailableMovies = [...(addedMovies || [])].reverse().concat(apiMovies || []);

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 9;
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = allAvailableMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(allAvailableMovies.length / moviesPerPage);

  useEffect(() => {
    // Dispatch the fetchMovies action on component mount if status is 'idle'
    // This will trigger the loading of API movies into the Redux store.
    if (status === 'idle') {
      dispatch(fetchMovies());
    }
  }, [status, dispatch]); // Dependencies to ensure the effect is triggered correctly

  // Handle case where `addedMovies` changes (a new movie is added)
  // This will force re-calculation of `allAvailableMovies` and update the display
  // but without re-fetching the API if API movies are already loaded.
  useEffect(() => {
    // This useEffect is necessary to recalculate `currentMovies` and `totalPages`
    // when `addedMovies` changes.
    // API fetching is already handled by `fetchMovies` dispatched once.
    setCurrentPage(1); // Reset to the first page to see new movies
  }, [addedMovies, apiMovies]); // Depends on addedMovies and apiMovies for updating

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  // Display loading/error states
  if (status === 'loading') {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading movies...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <p className="text-xl text-red-500">Error loading movies: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 min-h-screen">
        <div className="relative w-full h-[500px] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/video.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-purple-900/40 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-4xl px-4">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                MovieHub
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 font-light">
                Discover the most popular movies of the moment
              </p>
            </div>
          </div>
        </div>

        <div className="py-8 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Popular Movies
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
        </div>

        <div className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            <div className="flex justify-center mt-12 items-center gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  currentPage === 1
                    ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed border-gray-700/50'
                    : 'bg-gray-800/60 text-purple-300 hover:bg-purple-600/80 hover:text-white border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                ‹ Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-105 shadow-xl shadow-purple-500/25 border-purple-500/50'
                        : 'bg-gray-800/60 text-purple-300 hover:bg-purple-600/80 hover:text-white border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/25'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  currentPage === totalPages
                    ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed border-gray-700/50'
                    : 'bg-gray-800/60 text-purple-300 hover:bg-purple-600/80 hover:text-white border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
