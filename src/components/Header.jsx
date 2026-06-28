import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const Header = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  // Sync search query when URL changes (e.g., navigating back)
  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchQuery(searchParams.get('q') || '');
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, searchParams]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-[#1A4173] text-white shadow-md sticky top-0 z-50 pb-4 rounded-b-2xl">
      <div className="flex justify-between items-center w-full px-5 py-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white">
            <img src="/favicon.png" alt="하늘 청지기 로고" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white font-headline-md tracking-tight">하늘 청지기</h1>
        </Link>
      </div>
      
      {/* Search Bar in Header */}
      <div className="px-5">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-white/70 group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-inner focus:ring-2 focus:ring-white/50 focus:bg-white focus:text-slate-800 focus:placeholder-slate-400 transition-all outline-none text-white placeholder-white/70 text-sm font-medium" 
            placeholder="업종, 업체명, 교회명 검색" 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
