import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email Match Check
    if (formData.email !== formData.emailConfirm) {
      setError('이메일이 일치하지 않습니다.');
      return;
    }
    
    // Password Validation
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }
      
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      if (err.message === 'Email already exists') {
        setError('이미 가입된 이메일 입니다. 다른 이메일로 가입해주세요.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-margin-mobile py-xl">
        <div className="mb-lg text-center">
          <h2 className="text-headline-lg font-headline-lg text-primary mb-2">회원가입</h2>
          <p className="text-body-md text-on-surface-variant">하늘 청지기에 오신 것을 환영합니다.</p>
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
            <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FEE500] text-[#000000] rounded-xl font-bold shadow-sm relative">
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
            <span className="text-body-md text-on-surface-variant font-medium">또는 이메일로 가입</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="email">이메일 주소</label>
            <input 
              required
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="emailConfirm">이메일 확인</label>
            <input 
              required
              id="emailConfirm"
              name="emailConfirm"
              type="email" 
              value={formData.emailConfirm}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
              placeholder="위와 동일한 이메일을 입력해주세요"
            />
            {formData.emailConfirm && (
              <p className={`text-[12px] mt-1.5 pl-1 font-medium ${formData.email === formData.emailConfirm ? 'text-green-600' : 'text-error'}`}>
                {formData.email === formData.emailConfirm ? '이메일이 일치합니다.' : '이메일이 일치하지 않습니다.'}
              </p>
            )}
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
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
              placeholder="••••••••"
            />
            <p className="text-body-md text-outline mt-1.5 pl-1 text-[12px]">
              * 영문, 숫자를 포함하여 8자 이상 입력해주세요.
            </p>
          </div>

          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="passwordConfirm">비밀번호 확인</label>
            <input 
              required
              id="passwordConfirm"
              name="passwordConfirm"
              type="password" 
              value={formData.passwordConfirm}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
              placeholder="위와 동일한 비밀번호를 입력해주세요"
            />
            {formData.passwordConfirm && (
              <p className={`text-[12px] mt-1.5 pl-1 font-medium ${formData.password === formData.passwordConfirm ? 'text-green-600' : 'text-error'}`}>
                {formData.password === formData.passwordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="nickname">닉네임(이름)</label>
            <input 
              required
              id="nickname"
              name="nickname"
              type="text" 
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-label-lg text-on-surface mb-1" htmlFor="phone">연락처</label>
            <input 
              id="phone"
              name="phone"
              type="tel" 
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
              placeholder="010-1234-5678 (선택사항)"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold mt-6 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-body-md text-on-surface-variant">
          이미 계정이 있으신가요? 
          <Link to="/login" className="text-primary font-bold ml-1">로그인하기</Link>
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default Signup;
