import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const MyPage = () => {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const setAuth = useSetRecoilState(authState);

  // If not logged in, mock UI or redirect
  // For development demo purposes, we provide mock info if auth.user is null
  const user = auth.user || {
    nickname: '하늘성도',
    email: 'user@example.com',
    role: 'USER'
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('sky_token');
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto pt-4 pb-24 bg-surface min-h-screen">
        
        {/* Profile Card */}
        <div className="px-margin-mobile mb-6">
          <div className="bg-primary text-on-primary rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-headline-md font-headline-md">{user.nickname}님</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'BIZ' ? 'bg-secondary text-on-secondary' : 'bg-surface/20 text-on-primary'}`}>
                  {user.role === 'BIZ' ? '사업자 회원' : '일반 교인'}
                </span>
              </div>
              <p className="text-body-md opacity-80">{user.email}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">person</span>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="px-margin-mobile flex flex-col gap-3 mb-6">
          <Link to="/mypage/business-register" className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-body-lg mb-0.5">사업장 등록 및 관리</h3>
                <p className="text-label-sm text-on-surface-variant">성도님들의 일터를 등록하고 홍보하세요</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Link>

          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:shadow transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error/10 text-error rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">favorite</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-body-lg mb-0.5">내가 찜한 사업장</h3>
                <p className="text-label-sm text-on-surface-variant">관심 있는 업체를 모아보세요</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </div>

          <Link to="/church-register" className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">church</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-body-lg mb-0.5">소속 교회 등록 / 연결</h3>
                <p className="text-label-sm text-on-surface-variant">등록된 교회가 없다면 신규 등록하세요</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Link>
        </div>

        {/* Account Settings */}
        <div className="px-margin-mobile">
          <h3 className="text-label-lg font-bold text-outline uppercase mb-3 ml-1">계정 관리</h3>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant shadow-sm">
            <button className="w-full p-4 flex items-center justify-between hover:bg-surface-container/50 transition-colors">
              <span className="text-body-md text-on-surface">내 정보 수정</span>
              <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-surface-container/50 transition-colors">
              <span className="text-body-md text-on-surface">고객 센터 / 문의</span>
              <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
            </button>
            <button onClick={handleLogout} className="w-full p-4 flex items-center justify-between hover:bg-surface-container/50 transition-colors text-error">
              <span className="text-body-md font-bold">로그아웃</span>
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
        
      </main>
      <BottomNav />
    </>
  );
};

export default MyPage;
