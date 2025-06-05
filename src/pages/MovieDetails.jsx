import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function MovieDetails() {
  const { id } = useParams();
  const { addedMovies } = useSelector(state => state.movies);
  const [movie, setMovie] = useState(null);
  const [fromLocal, setFromLocal] = useState(false);

  useEffect(() => {
    const localMovie = addedMovies.find(m => m.id === Number(id));
    if (localMovie) {
      setMovie(localMovie);
      setFromLocal(true);
    } else {
      axios
        .get(`https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
        .then(res => {
          setMovie(res.data);
          setFromLocal(false);
        })
        .catch(err => console.error(err));
    }
  }, [id, addedMovies]);

  if (!movie) {
    return (
      <div className="pt-24 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-6"></div>
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 pb-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white relative">
      {/* Couche de fond pour éliminer les espaces blancs */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10"></div>
      
      <div className="m-10 w-full max-w-screen-lg mx-auto">
        <div className="flex flex-col">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
            
            {/* Titre principal avec glassmorphism effect */}
            <div className="text-center mb-8">
              <div className="inline-block p-6 rounded-xl backdrop-blur-md bg-slate-800/30 border border-slate-700/50 shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2">
                  🎬 {movie.title}
                </h1>
                <p className="text-slate-300">
                  Movie Details
                </p>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Image du film */}
              <div className="flex-shrink-0 w-full lg:w-80">
                <img
                  src={
                    fromLocal
                      ? movie.image
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`
                  }
                  alt={movie.title}
                  className="w-full rounded-xl shadow-2xl object-cover border border-purple-500/20"
                />
              </div>

              {/* Détails du film */}
              <div className="flex-1 space-y-6">
                
                {/* Description */}
                <div className="group">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors">
                    Synopsis
                  </h3>
                  <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 p-4 shadow-lg backdrop-blur-sm">
                    <p className="text-gray-200 leading-relaxed">
                      {fromLocal ? movie.description : movie.overview}
                    </p>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Date de sortie */}
                  <div className="group">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2 group-focus-within:text-purple-200 transition-colors">
                      Release Date
                    </h4>
                    <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg backdrop-blur-sm">
                      <p className="text-white">
                        {new Date(movie.release_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Note (seulement pour les films TMDB) */}
                  {!fromLocal && (
                    <div className="group">
                      <h4 className="text-sm font-semibold text-purple-300 mb-2 group-focus-within:text-purple-200 transition-colors">
                        Rating
                      </h4>
                      <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">
                            {movie.vote_average?.toFixed(1)}
                          </span>
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-gray-400 text-sm">
                            / 10
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations additionnelles pour les films TMDB */}
                {!fromLocal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {movie.runtime && (
                      <div className="group">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">
                          Duration
                        </h4>
                        <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg backdrop-blur-sm">
                          <p className="text-white">
                            {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
                          </p>
                        </div>
                      </div>
                    )}

                    {movie.genres && movie.genres.length > 0 && (
                      <div className="group">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">
                          Genres
                        </h4>
                        <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg backdrop-blur-sm">
                          <div className="flex flex-wrap gap-2">
                            {movie.genres.map((genre) => (
                              <span
                                key={genre.id}
                                className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded-lg border border-purple-500/30"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Badge pour les films locaux */}
                {fromLocal && (
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 text-sm bg-green-600/30 text-green-200 rounded-lg border border-green-500/30">
                      📁 Personal Collection
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}