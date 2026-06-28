import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSetRecoilState(authState);
  const [error, setError] = useState('');

  useEffect(() => {
    const processKakaoLogin = async () => {
      // 1. Get the authorization code from URL
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('카카오 로그인이 취소되었거나 실패했습니다.');
        return;
      }

      if (!code) {
        setError('인가 코드가 없습니다.');
        return;
      }

      // 2. Determine redirect URI based on current origin
      // In production, this should match the exact redirect URI set in Kakao console.
      const redirectUri = `${window.location.origin}/auth/kakao/callback`;

      try {
        // 3. Send code to backend
        const res = await fetch('/api/auth/kakao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || '카카오 로그인 처리에 실패했습니다.');
        }

        // 4. Update auth state
        setAuth({
          isAuthenticated: true,
          user: data.user,
          token: data.token
        });
        
        localStorage.setItem('sky_token', data.token);
        localStorage.setItem('sky_user', JSON.stringify(data.user));

        // 5. Redirect to Home
        navigate('/', { replace: true });

      } catch (err) {
        console.error('Kakao login error:', err);
        setError(err.message);
      }
    };

    processKakaoLogin();
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
            <div className="w-16 h-16 border-4 border-[#FEE500] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-body-lg text-slate-600 font-medium animate-pulse">
              카카오 계정으로 로그인 중입니다...
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
};

export default KakaoCallback;
