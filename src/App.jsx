import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import AddMovie from './pages/AddMovie';
import MovieDetails from './pages/MovieDetails';
import Navbar from './components/Navbar'; // 

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recherche" element={<Search />} />
        <Route path="/ajouter" element={<AddMovie />} />
        <Route path="/film/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
