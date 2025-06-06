import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function MovieDetails() {
  const { id } = useParams();
  const { addedMovies } = useSelector(state => state.movies);
  const [movie, setMovie] = useState(null);
  const [fromLocal, setFromLocal] = useState(false);

  const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
  };

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

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}min`;
  };

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

  const imageUrl = fromLocal
    ? movie.poster_path || movie.image // Assuming 'image' for local if 'poster_path' isn't present
    : `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`;

  // FIX: Access description consistently for local and TMDB movies
  const description = fromLocal
    ? (movie.description || movie.overview || "Aucune description fournie.") // Try 'description' first, then 'overview' for local
    : (movie.overview || "No synopsis available."); // TMDB uses 'overview'

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : "Date inconnue";
  const rating = movie.vote_average?.toFixed(1);
  const duration = movie.runtime ? formatDuration(movie.runtime) : (fromLocal && movie.runtime ? formatDuration(movie.runtime) : null);
  const genres = fromLocal && movie.genre_ids
    ? movie.genre_ids.map(id => genreMap[id] || id)
    : movie.genres?.map(g => g.name);

  return (
    <div className="pt-24 px-4 pb-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10"></div>

      <div className="m-10 w-full max-w-screen-lg mx-auto">
        <div className="flex flex-col">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">

            <div className="text-center mb-8">
              <div className="inline-block p-6 rounded-xl backdrop-blur-md bg-slate-800/30 border border-slate-700/50 shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2">
                  🎬 {movie.title}
                </h1>
                <p className="text-slate-300">Movie Details</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-full lg:w-80">
                <img
                  src={imageUrl}
                  alt={movie.title}
                  className="w-full rounded-xl shadow-2xl object-cover border border-purple-500/20"
                />
              </div>

              <div className="flex-1 space-y-6">
                <div className="group">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Synopsis</h3>
                  <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 p-4 shadow-lg backdrop-blur-sm">
                    <p className="text-gray-200 leading-relaxed">{description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Release Date</h4>
                    <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg">
                      <p className="text-white">{releaseDate}</p>
                    </div>
                  </div>

                  {rating && (
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Rating</h4>
                      <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">{rating}</span>
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-gray-400 text-sm">/ 10</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {duration && (
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Duration</h4>
                      <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg">
                        <p className="text-white">{duration}</p>
                      </div>
                    </div>
                  )}

                  {genres?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Genres</h4>
                      <div className="rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg">
                        <div className="flex flex-wrap gap-2">
                          {genres.map((name, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded-lg border border-purple-500/30"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}