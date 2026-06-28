import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useSetRecoilState(authState);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = () => {
    const clientId = '54aba65c523195665e84dfbfd648ff70';
    const redirectUri = `${window.location.origin}/auth/kakao/callback`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  const handleNaverLogin = () => {
    const clientId = 'uVhtUn8Vu_Xav3KaHU5b';
    const redirectUri = `${window.location.origin}/auth/naver/callback`;
    // 네이버 로그인은 상태(state) 토큰이 필수입니다. 랜덤 문자열을 생성하여 사용합니다.
    const state = Math.random().toString(36).substring(3, 14);
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = naverAuthUrl;
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }
      
      // Update global auth state
      setAuth({
        isAuthenticated: true,
        user: data.user,
        token: data.token
      });
      
      // Save to localStorage for persistence
      localStorage.setItem('sky_token', data.token);
      localStorage.setItem('sky_user', JSON.stringify(data.user));

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-margin-mobile py-xl">
        <div className="mb-lg text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>church</span>
          </div>
          <h2 className="text-headline-lg font-headline-lg text-primary mb-2">당신을 환영합니다</h2>
          <p className="text-body-md text-on-surface-variant">하늘 청지기 서비스 이용을 위해 로그인해주세요.</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg text-body-md mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* SNS Login Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleKakaoLogin}
              type="button"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#391B1B] bg-[#FEE500] hover:bg-[#F4DC00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEE500] transition-colors items-center gap-2 relative"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current absolute left-4">
                <path d="M12 3c-5.523 0-10 3.52-10 7.864 0 2.802 1.83 5.253 4.605 6.643l-1.042 3.905c-.066.246.216.438.418.27l4.577-3.05c.466.07 .946.108 1.442.108 5.523 0 10-3.52 10-7.864C22 6.52 17.523 3 12 3z"/>
              </svg>
              카카오로 1초 만에 시작하기
            </button>
            <button
              onClick={handleNaverLogin}
              type="button"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#03C75A] hover:bg-[#02b351] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#03C75A] transition-colors items-center gap-2 relative"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current absolute left-4">
                <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
              네이버로 1초 만에 시작하기
            </button>
            <button
              onClick={handleGoogleLogin}
              type="button" 
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-outline-variant text-[#3C4043] rounded-xl font-bold shadow-sm relative transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              구글로 1초 만에 시작하기
            </button>
          </div>
          
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">또는 이메일로 로그인</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="email">이메일</label>
            <input 
              required
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="password">비밀번호</label>
            <input 
              required
              id="password"
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold mt-6 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-body-md text-on-surface-variant flex items-center justify-center gap-2 divide-x divide-outline-variant">
          <Link to="/signup" className="text-primary font-bold pr-2">회원가입</Link>
          <button className="pl-2 hover:text-primary transition-colors">비밀번호 찾기</button>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default Login;
