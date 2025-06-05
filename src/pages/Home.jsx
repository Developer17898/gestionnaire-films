import { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import Navbar from '../components/Navbar';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const moviesPerPage = 9;
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const pagesToFetch = [1, 2, 3];
        const allResults = [];

        for (const page of pagesToFetch) {
          const res = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${page}`
          );
          allResults.push(...res.data.results);
        }

        setMovies(allResults);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 min-h-screen">
        {/* Hero Section avec vidéo */}
        <div className="relative w-full h-[500px] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/video.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la vidéo HTML5.
          </video>
          
          {/* Overlay avec gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-purple-900/40 to-transparent"></div>
          
          {/* Contenu hero */}
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

        {/* Section Films Populaires */}
        <div className="py-8 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Popular Movies
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Grille des films */}
        <div className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 items-center gap-2 flex-wrap">
              {/* ← Previous */}
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

              {/* Pages */}
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

              {/* → Next */}
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