import { useState, useEffect } from 'react';

export default function AddMovie() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [rating, setRating] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fonction pour convertir les minutes en format "2h 18min"
  const formatDuration = (minutes) => {
    if (!minutes) return "";
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  };

  // Charger la liste des genres au montage du composant
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // Simulation des genres pour la démo
        const mockGenres = [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" },
          { id: 35, name: "Comedy" },
          { id: 80, name: "Crime" },
          { id: 99, name: "Documentary" },
          { id: 18, name: "Drama" },
          { id: 10751, name: "Family" },
          { id: 14, name: "Fantasy" },
          { id: 36, name: "History" },
          { id: 27, name: "Horror" },
          { id: 10402, name: "Music" },
          { id: 9648, name: "Mystery" },
          { id: 10749, name: "Romance" },
          { id: 878, name: "Science Fiction" },
          { id: 10770, name: "TV Movie" },
          { id: 53, name: "Thriller" },
          { id: 10752, name: "War" },
          { id: 37, name: "Western" }
        ];
        setGenres(mockGenres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 3 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("❌ Invalid format. Use .png or .jpg");
      setImage(null);
      setImageName("No file chosen");
      setImagePreview(null);
      return;
    }

    if (file.size > maxSize) {
      setError("❌ Image too large (max 3 MB).");
      setImage(null);
      setImageName("No file chosen");
      setImagePreview(null);
      return;
    }

    setImage(file);
    setImageName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const saveToMemory = (newMovie) => {
    try {
      console.log('Movie saved:', newMovie);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !releaseDate || !duration || !image || selectedGenres.length === 0) {
      setError("❗Please fill in all fields, choose an image, and select at least one genre.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newMovie = {
        id: Date.now(),
        title: title.trim(),
        overview: description.trim(),
        release_date: releaseDate,
        runtime: parseInt(duration),
        genre_ids: selectedGenres,
        vote_average: rating ? parseFloat(rating) : 0,
        poster_path: reader.result,
        backdrop_path: reader.result,
        created_at: new Date().toISOString(),
        isCustom: true
      };

      const saved = saveToMemory(newMovie);
      
      if (saved) {
        setMessage("✅ Movie added successfully!");
        setError("");

        setTitle("");
        setDescription("");
        setReleaseDate("");
        setDuration("");
        setSelectedGenres([]);
        setRating("");
        setImage(null);
        setImageName("No file chosen");
        setImagePreview(null);

        setTimeout(() => {
          setMessage("🎬 Redirecting to home...");
        }, 2000);
      } else {
        setError("❌ Save error. Please try again.");
      }
    };

    reader.readAsDataURL(image);
  };

  return (
    <div className="pt-24 px-4 pb-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating movie icons */}
      <div className="absolute top-32 right-20 text-6xl animate-bounce opacity-20 delay-300">🎬</div>
      <div className="absolute top-60 left-20 text-4xl animate-bounce opacity-15 delay-700">🍿</div>
      <div className="absolute bottom-40 right-40 text-5xl animate-bounce opacity-10 delay-1000">🎭</div>
      <div className="absolute bottom-20 left-40 text-3xl animate-bounce opacity-20 delay-500">🎪</div>

      <div className="m-10 w-full max-w-screen-xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Formulaire principal */}
          <div className="flex-1">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
              
              {/* Titre principal avec glassmorphism effect */}
              <div className="text-center mb-8">
                <div className="inline-block p-6 rounded-xl backdrop-blur-md bg-slate-800/30 border border-slate-700/50 shadow-2xl">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-4xl">🎬</span>
                    <h1 className="text-3xl font-bold text-white">
                      Add Movie
                    </h1>
                    <span className="text-4xl">✨</span>
                  </div>
                  <p className="text-slate-300">
                    Expand your movie collection with style
                  </p>
                </div>
              </div>

              {/* Messages d'erreur et de succès */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm animate-pulse">
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </div>
              )}
              
              {message && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-sm animate-pulse">
                  <p className="text-green-200 text-sm font-medium">{message}</p>
                </div>
              )}

              <div className="space-y-8">
                
                {/* Grille des champs principaux */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  
                  {/* Titre du film */}
                  <div className="flex flex-col group lg:col-span-2">
                    <label htmlFor="title" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">🎭</span>
                      Movie Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Inception"
                      className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300"
                    />
                  </div>

                  {/* Rating */}
                  <div className="flex flex-col group">
                    <label htmlFor="rating" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      Rating
                    </label>
                    <input
                      type="number"
                      id="rating"
                      min="0"
                      max="10"
                      step="0.1"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300"
                    />
                  </div>

                  {/* Date de sortie */}
                  <div className="flex flex-col group">
                    <label htmlFor="releaseDate" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      Release Date
                    </label>
                    <input
                      type="date"
                      id="releaseDate"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white transition-all duration-300"
                    />
                  </div>

                  {/* Durée */}
                  <div className="flex flex-col group">
                    <label htmlFor="duration" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 148"
                      className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Description - pleine largeur */}
                <div className="flex flex-col group">
                  <label htmlFor="description" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the movie plot, themes, and what makes it special..."
                    rows={4}
                    className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Sélection des genres */}
                <div className="flex flex-col group">
                  <label className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                    <span className="text-lg">🎪</span>
                    Genres (Select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 rounded-xl border border-purple-500/30 bg-gray-800/30">
                    {genres.map((genre) => (
                      <label
                        key={genre.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-purple-600/50 border border-purple-400/50 shadow-lg'
                            : 'bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30'
                        }`}
                        onClick={() => handleGenreToggle(genre.id)}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-purple-500 border-purple-400'
                            : 'border-gray-400'
                        }`}>
                          {selectedGenres.includes(genre.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-200">{genre.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Upload d'image */}
                <div className="flex flex-col group">
                  <label className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                    <span className="text-lg">🖼️</span>
                    Movie Poster
                  </label>
                  
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-purple-500/30 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-purple-400 group-hover:text-purple-300 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-purple-300 group-hover:text-white transition-colors">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-400 mb-1">{imageName}</p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 3MB)</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => console.log('Navigate to home')}
                    className="px-8 py-3 rounded-xl bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-purple-500/25"
                  >
                    🎬 Add Movie
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau de prévisualisation */}
          <div className="lg:w-80">
            <div className="sticky top-28">
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-6 shadow-2xl shadow-purple-500/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Preview
                </h3>
                
                {/* Prévisualisation de l'image */}
                <div className="mb-4">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-700/50 border border-gray-600/30">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <span className="text-6xl mb-2 block">🎬</span>
                          <p className="text-sm">No image selected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Infos du film */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-semibold">
                      {title || "Movie Title"}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    {rating && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        ⭐ {rating}
                      </span>
                    )}
                    {duration && (
                      <span className="text-gray-300">
                        {formatDuration(parseInt(duration))}
                      </span>
                    )}
                  </div>

                  {releaseDate && (
                    <div className="text-sm text-gray-300">
                      📅 {new Date(releaseDate).getFullYear()}
                    </div>
                  )}

                  {selectedGenres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedGenres.map((genreId) => {
                        const genre = genres.find(g => g.id === genreId);
                        return genre ? (
                          <span
                            key={genreId}
                            className="px-2 py-1 bg-purple-600/50 text-purple-200 text-xs rounded-full"
                          >
                            {genre.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {description && (
                    <div className="text-sm text-gray-300 line-clamp-3">
                      {description}
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