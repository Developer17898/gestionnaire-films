import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMovie } from '../redux/moviesSlice';

export default function AddMovie() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access Redux data
  const { addedMovies, movies } = useSelector(state => state.movies);

  // Combine all movies (API + manually added).
  // This ensures that checkForTitleDuplicate accesses ALL movies.
  const allMovies = [...(movies || []), ...(addedMovies || [])];

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

  const checkForTitleDuplicate = (newTitle) => {
    const normalizedNewTitle = newTitle.trim().toLowerCase().replace(/\s+/g, ' ');

    console.log('Checking for title duplicate:', normalizedNewTitle);
    console.log('Total movies to check:', allMovies.length);

    return allMovies.some(movie => {
      const normalizedExistingTitle = movie.title.trim().toLowerCase().replace(/\s+/g, ' ');
      return normalizedExistingTitle === normalizedNewTitle;
    });
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
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

  useEffect(() => {
    // Clear errors not related to duplicate titles when title changes
    // or when other fields are modified, unless the current error is a duplicate title.
    if (error && !error.includes("title already exists")) {
      setError("");
    }

    // Real-time title duplicate check
    if (title.trim().length >= 2) {
      const isDuplicate = checkForTitleDuplicate(title);
      if (isDuplicate) {
        setError("⚠️ A movie with this title already exists in your collection!");
      } else {
        // Clear title error if title is no longer a duplicate
        if (error.includes("title already exists")) {
            setError("");
        }
      }
    }
  }, [title, allMovies, error]); // Dependencies updated to react to title or movie list changes

  const handleImageChange = (e) => {
    setError(""); // Clear previous errors when selecting a new image
    const file = e.target.files[0];
    if (!file) {
        setImage(null);
        setImageName("No file chosen");
        setImagePreview(null);
        return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 3 * 1024 * 1024; // 3 MB

    if (!allowedTypes.includes(file.type)) {
      setError("❌ Invalid format. Please use .png or .jpg");
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

    const reader = new FileReader();
    reader.onload = () => {
      const imageBase64 = reader.result;
      setImagePreview(imageBase64);
      // Image duplicate check is intentionally omitted here.
    };
    reader.readAsDataURL(file);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    // Clear "Please select at least one genre" error if a genre is selected
    if (selectedGenres.length === 0 && error.includes("select at least one genre")) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // --- Required field validation ---
    if (!title.trim()) {
      setError("❗ Movie title is required.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!description.trim()) {
      setError("❗ Movie description is required.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!releaseDate) {
      setError("❗ Release date is required.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!duration) {
      setError("❗ Movie duration is required.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (selectedGenres.length === 0) {
      setError("❗ Please select at least one genre.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!image) {
      setError("❗ Please choose an image for the movie.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // --- End of required field validation ---


    // ⭐ Title duplicate check BEFORE final addition ⭐
    if (checkForTitleDuplicate(title)) {
        setError("🚫 A movie with this title already exists in your collection!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; // Prevent addition if title is a duplicate
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageBase64 = reader.result;

      const newMovie = {
        id: Date.now(), // Use Date.now() for a simple unique ID
        title: title.trim(),
        overview: description.trim(),
        release_date: releaseDate,
        runtime: parseInt(duration),
        genre_ids: selectedGenres,
        vote_average: rating ? parseFloat(rating) : 0, // Convert to float
        poster_path: imageBase64,
        backdrop_path: imageBase64, // Use the same image for the backdrop for simplicity
        created_at: new Date().toISOString(), // Movie creation date
        isCustom: true // Mark as a user-added movie
      };

      try {
        console.log('Attempting to add movie:', newMovie.title);

        // Dispatch Redux action to add the movie
        dispatch(addMovie(newMovie));

        setMessage("✅ Movie added successfully!");
        setError(""); // Ensure no error remains displayed

        // Reset fields after success
        setTitle("");
        setDescription("");
        setReleaseDate("");
        setDuration("");
        setSelectedGenres([]);
        setRating("");
        setImage(null);
        setImageName("No file chosen");
        setImagePreview(null);

        // Redirect after a short delay
        setTimeout(() => {
          setMessage("🎬 Redirecting to home...");
          setTimeout(() => {
            navigate('/'); // Redirects to the home page
          }, 1000);
        }, 2000);

      } catch (saveError) {
        console.error('Error saving movie:', saveError);
        setError("❌ Error saving movie. Please try again.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Read the image as a Base64 data URL if an image is selected
    // This part is executed after all initial validations
    if (image) {
        reader.readAsDataURL(image);
    }
  };

  const handleCancel = () => {
    navigate('/'); // Returns to the home page
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

          {/* Main Form */}
          <div className="flex-1">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">

              {/* Main title with glassmorphism effect */}
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
                  {/* Display total number of movies */}
                  <p className="text-sm text-purple-300 mt-2">
                    {allMovies.length} movies in your collection
                  </p>
                </div>
              </div>

              {/* Error and Success Messages */}
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

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Grid for main fields */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                  {/* Movie Title */}
                  <div className="flex flex-col group lg:col-span-2">
                    <label htmlFor="title" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">🎭</span>
                      Movie Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Inception"
                      required
                      className={`block w-full rounded-xl border px-4 py-3 shadow-lg outline-none text-white placeholder-gray-400 transition-all duration-300 ${
                        error.includes("title already exists") // Check title error here for styling
                          ? 'border-red-500/50 bg-red-900/20 focus:border-red-400 focus:ring-2 focus:ring-red-400/30'
                          : 'border-purple-500/30 bg-gray-800/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80'
                      }`}
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

                  {/* Release Date */}
                  <div className="flex flex-col group">
                    <label htmlFor="releaseDate" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      Release Date *
                    </label>
                    <input
                      type="date"
                      id="releaseDate"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white transition-all duration-300"
                    />
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col group">
                    <label htmlFor="duration" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 148"
                      required
                      className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Description - full width */}
                <div className="flex flex-col group">
                  <label htmlFor="description" className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the movie plot, themes, and what makes it special..."
                    rows={4}
                    required
                    className="block w-full rounded-xl border border-purple-500/30 bg-gray-800/60 px-4 py-3 shadow-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 focus:bg-gray-800/80 text-white placeholder-gray-400 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Genre Selection */}
                <div className="flex flex-col group">
                  <label className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                    <span className="text-lg">🎪</span>
                    Genres (Select at least one) *
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

                {/* Image Upload */}
                <div className="flex flex-col group">
                  <label className="text-sm font-semibold text-purple-300 mb-3 group-focus-within:text-purple-200 transition-colors flex items-center gap-2">
                    <span className="text-lg">🖼️</span>
                    Movie Poster *
                  </label>

                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 group ${
                      error.includes("Invalid format") || error.includes("too large")
                        ? 'border-red-500/50 bg-red-900/20 hover:bg-red-900/30'
                        : 'border-purple-500/30 bg-gray-800/30 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className={`w-10 h-10 mb-3 transition-colors ${
                          error.includes("Invalid format") || error.includes("too large")
                            ? 'text-red-400 group-hover:text-red-300'
                            : 'text-purple-400 group-hover:text-purple-300'
                        }`}
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-3 rounded-xl bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    // Disable button if a duplicate title error or validation errors are present
                    disabled={!!error || !title.trim() || !description.trim() || !releaseDate || !duration || !image || selectedGenres.length === 0}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        (!!error || !title.trim() || !description.trim() || !releaseDate || !duration || !image || selectedGenres.length === 0)
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/25'
                    }`}
                  >
                    🎬 Add Movie
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:w-80">
            <div className="sticky top-28">
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/80 backdrop-blur-xl p-6 shadow-2xl shadow-purple-500/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Preview
                </h3>

                {/* Image Preview */}
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

                {/* Movie Info */}
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
                      {genres.filter(g => selectedGenres.includes(g.id)).map((genre) => (
                          <span
                            key={genre.id}
                            className="px-2 py-1 bg-purple-600/50 text-purple-200 text-xs rounded-full"
                          >
                            {genre.name}
                          </span>
                        ))}
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
