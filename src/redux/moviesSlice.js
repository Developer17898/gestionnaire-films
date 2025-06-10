import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // N'oubliez pas d'importer axios ici !

// Action asynchrone pour la récupération des films de l'API.
// Cette action va maintenant effectuer l'appel API réel.
export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (_, { rejectWithValue }) => {
    try {
      const pagesToFetch = [1, 2, 3]; // Récupérer les films de plusieurs pages
      const allResults = [];

      for (const page of pagesToFetch) {
        // Assurez-vous que VITE_TMDB_API_KEY est bien configuré dans votre fichier .env
        // et accessible via import.meta.env
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${page}`
        );
        allResults.push(...res.data.results);
      }
      console.log("Films API chargés via Redux:", allResults.length, "films");
      return allResults; // Retourne les films pour mettre à jour l'état Redux
    } catch (err) {
      console.error("Échec du chargement des films API dans Redux:", err);
      // Utilisez rejectWithValue pour renvoyer une erreur que extraReducers peut gérer
      return rejectWithValue(err.message || "Erreur inconnue lors de la récupération des films.");
    }
  }
);


const initialState = {
  movies: [], // Pour stocker les films de l'API
  addedMovies: JSON.parse(localStorage.getItem("myMovies")) || [], // Films ajoutés manuellement
  searchResults: [], // Résultats de recherche temporaires
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // Message d'erreur en cas d'échec
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    // Action pour ajouter un film manuellement
    addMovie: (state, action) => {
      state.addedMovies.push(action.payload);
      localStorage.setItem("myMovies", JSON.stringify(state.addedMovies));
      console.log("Film ajouté manuellement:", action.payload.title);
    },
    // Action pour définir les résultats de recherche (utilisée par la page de recherche)
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    // Vous pouvez ajouter d'autres reducers ici si nécessaire (ex: removeMovie, updateMovie)
  },
  extraReducers: (builder) => {
    builder
      // Gère l'état pendant que la récupération des films est en cours
      .addCase(fetchMovies.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Réinitialiser l'erreur en cas de nouvelle tentative
      })
      // Gère l'état lorsque la récupération des films a réussi
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.movies = action.payload; // Stocke les films récupérés de l'API
      })
      // Gère l'état lorsque la récupération des films a échoué
      .addCase(fetchMovies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message; // Utilise le payload de rejectWithValue si disponible
      });
  },
});

export const { addMovie, setSearchResults } = moviesSlice.actions;
export default moviesSlice.reducer;
