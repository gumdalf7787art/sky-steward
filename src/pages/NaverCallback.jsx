import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NaverCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
          // AuthContext의 login 함수를 호출하여 로컬 상태 업데이트
          login(data.token, data.user);
          
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
  }, [location, navigate, login]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl text-center max-w-md w-full shadow-sm">
          <span className="material-symbols-outlined text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold mb-4">{error}</h2>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-slate-600 font-medium text-lg animate-pulse">
        네이버 로그인 중입니다...
      </p>
    </div>
  );
}

export default NaverCallback;
