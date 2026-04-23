import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-slate-50 dark:bg-slate-900 shadow-sm dark:shadow-none border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-5 py-3 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/favicon.png" alt="하늘 청지기 로고" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-[#1A4173] dark:text-blue-400 font-headline-md">하늘 청지기</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
