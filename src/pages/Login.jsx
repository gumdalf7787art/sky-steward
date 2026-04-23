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
