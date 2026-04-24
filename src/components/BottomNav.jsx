import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '../atoms/auth';

const BottomNav = () => {
  const auth = useRecoilValue(authState);
  const location = useLocation();

  const isLoggedIn = auth.isAuthenticated;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_12px_rgba(26,65,115,0.08)]">
      <Link className={`flex flex-col items-center justify-center ${location.pathname === '/' ? 'text-[#1A4173] dark:text-blue-300 font-bold' : 'text-slate-400'}`} to="/">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="font-public-sans text-[11px] font-medium">홈</span>
      </Link>
      
      <Link className={`flex flex-col items-center justify-center ${location.pathname === '/search' ? 'text-[#1A4173] dark:text-blue-300 font-bold' : 'text-slate-400'}`} to="/search">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/search' ? "'FILL' 1" : "'FILL' 0" }}>search</span>
        <span className="font-public-sans text-[11px] font-medium">검색</span>
      </Link>
      
      {isLoggedIn ? (
        <>
          <Link className={`flex flex-col items-center justify-center ${location.pathname === '/favorites' ? 'text-[#1A4173] dark:text-blue-300 font-bold' : 'text-slate-400'}`} to="/favorites">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/favorites' ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            <span className="font-public-sans text-[11px] font-medium">관심업체</span>
          </Link>
          <Link className={`flex flex-col items-center justify-center ${location.pathname === '/mypage' ? 'text-[#1A4173] dark:text-blue-300 font-bold' : 'text-slate-400'}`} to="/mypage">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/mypage' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
            <span className="font-public-sans text-[11px] font-medium">마이페이지</span>
          </Link>
        </>
      ) : (
        <>
          <Link className={`flex flex-col items-center justify-center ${location.pathname === '/signup' ? 'text-[#1A4173] dark:text-blue-300 font-bold' : 'text-slate-400'}`} to="/signup">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/signup' ? "'FILL' 1" : "'FILL' 0" }}>person_add</span>
            <span className="font-public-sans text-[11px] font-medium">회원가입</span>
          </Link>
          <Link className={`flex flex-col items-center justify-center ${location.pathname === '/login' ? 'text-[#1A4173] dark:text-blue-300 font-bold' : 'text-slate-400'}`} to="/login">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/login' ? "'FILL' 1" : "'FILL' 0" }}>login</span>
            <span className="font-public-sans text-[11px] font-medium">로그인</span>
          </Link>
        </>
      )}
    </nav>
  );
};

export default BottomNav;
