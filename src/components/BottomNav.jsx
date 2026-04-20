import React from 'react';
import { Link } from 'react-router-dom';

const BottomNav = ({ isLoggedIn = false }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_12px_rgba(26,65,115,0.08)]">
      <Link className="flex flex-col items-center justify-center text-[#1A4173] dark:text-blue-300 font-bold" to="/">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-public-sans text-[11px] font-medium">홈</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#1A4173] dark:hover:text-blue-300 transition-transform duration-150 scale-95" to="/search">
        <span className="material-symbols-outlined">search</span>
        <span className="font-public-sans text-[11px] font-medium">검색</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#1A4173] dark:hover:text-blue-300 transition-transform duration-150 scale-95" to="/community">
        <span className="material-symbols-outlined">groups</span>
        <span className="font-public-sans text-[11px] font-medium">커뮤니티</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#1A4173] dark:hover:text-blue-300 transition-transform duration-150 scale-95" to="/mypage">
        <span className="material-symbols-outlined">person</span>
        <span className="font-public-sans text-[11px] font-medium">마이페이지 {isLoggedIn ? '1' : '0'}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
