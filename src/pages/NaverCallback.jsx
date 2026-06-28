import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const NaverCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSetRecoilState(authState);
  const [error, setError] = useState('');

  useEffect(() => {
    const processNaverAuth = async () => {
      // URL 쿼리 스트링에서 코드와 상태값 추출
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) {
        setError('네이버 로그인 정보가 전달되지 않았습니다.');
        return;
      }

      try {
        const response = await fetch('/api/auth/naver', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code, 
            state,
            redirectUri: `${window.location.origin}/auth/naver/callback` 
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Update global auth state
          setAuth({
            isAuthenticated: true,
            user: data.user,
            token: data.token
          });
          
          // Save to localStorage for persistence
          localStorage.setItem('sky_token', data.token);
          localStorage.setItem('sky_user', JSON.stringify(data.user));
          
          // 메인 페이지로 이동 (replace: true 로 설정하여 뒤로가기 방지)
          navigate('/', { replace: true });
        } else {
          setError(data.error || '네이버 로그인 처리에 실패했습니다.');
        }
      } catch (err) {
        console.error('Naver callback error:', err);
        setError('인증 처리 중 서버 오류가 발생했습니다.');
      }
    };

    processNaverAuth();
  }, [location, navigate, setAuth]);

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-margin-mobile py-xl text-center min-h-[60vh] flex flex-col justify-center items-center">
        {error ? (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[32px]">error</span>
            <p className="font-medium text-body-lg">{error}</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#03C75A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-body-lg text-slate-600 font-medium animate-pulse">
              네이버 계정으로 로그인 중입니다...
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

export default NaverCallback;
