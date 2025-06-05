import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Menu, X, Film } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recherche', label: 'Search', icon: Search },
    { path: '/ajouter', label: 'Add Movie', icon: PlusCircle }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl shadow-purple-500/10' 
        : 'bg-slate-900/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-300 shadow-lg shadow-purple-500/25">
              <Film className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              MovieHub
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2 rounded-xl space-x-2 font-medium transition-all duration-300 hover:scale-105 ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/25 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-purple-500/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-800/60 transition-all duration-300 hover:border-purple-500/20 border border-transparent"
          >
            {isMenuOpen ? 
              <X className="h-6 w-6 text-purple-400" /> : 
              <Menu className="h-6 w-6 text-purple-400" />
            }
          </button>
        </div>

        {/* Mobile menu items */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-purple-500/20 mt-2 pt-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-4 py-3 space-x-3 w-full text-left rounded-xl transition-all duration-300 mb-2 ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/25 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-purple-500/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}