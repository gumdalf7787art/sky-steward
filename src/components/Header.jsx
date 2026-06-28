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
    <header className="bg-[#1A4173] text-white shadow-md sticky top-0 z-50 rounded-b-xl">
      <div className="flex justify-between items-center w-full px-4 py-3">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm">
            <img src="/favicon.png" alt="하늘 청지기 로고" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white font-headline-md tracking-tight whitespace-nowrap">하늘 청지기</h1>
        </Link>
        
        {/* Search Bar in Header */}
        <div className="flex-1 ml-3 flex justify-end">
          <div className="relative group w-full max-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[18px]">search</span>
            </div>
            <input 
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white rounded-xl shadow-inner focus:ring-2 focus:ring-white/50 text-slate-800 placeholder-slate-400 transition-all outline-none text-[13px] sm:text-sm font-medium" 
              placeholder="업종, 업체명 검색" 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
