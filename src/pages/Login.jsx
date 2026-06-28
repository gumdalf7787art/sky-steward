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
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/kakao/callback`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = kakaoAuthUrl;
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
            <button type="button" onClick={handleKakaoLogin} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FEE500] text-[#000000] rounded-xl font-bold shadow-sm relative">
              <span className="material-symbols-outlined absolute left-4 text-[20px]">chat</span>
              카카오로 시작하기
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#03C75A] text-white rounded-xl font-bold shadow-sm relative">
              <span className="material-symbols-outlined absolute left-4 text-[20px]">eco</span>
              네이버로 시작하기
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-outline-variant text-[#3C4043] rounded-xl font-bold shadow-sm relative">
              <span className="material-symbols-outlined absolute left-4 text-[20px]">account_circle</span>
              구글로 시작하기
            </button>
          </div>
          
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="text-body-md text-on-surface-variant font-medium">또는 이메일로 로그인</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
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
