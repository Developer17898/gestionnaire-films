import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  addedMovies: JSON.parse(localStorage.getItem("myMovies")) || [],
  searchResults: []
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addMovie: (state, action) => {
      state.addedMovies.push(action.payload);
    console.log("initialstate",initialState)
      localStorage.setItem("myMovies", JSON.stringify(state.addedMovies));
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    }
  }
});

export const { addMovie, setSearchResults } = moviesSlice.actions;
export default moviesSlice.reducer;