import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const MyPage = () => {
  const navigate = useNavigate();
  const setAuth = useSetRecoilState(authState);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. localStorage에서 사용자 정보 로드 (새로고침 대응)
    const storedUser = localStorage.getItem('sky_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    } else {
      // 로그인 정보가 없으면 로그인 페이지로 이동 (실제 운영 시)
      // navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // 1. Recoil 상태 초기화
    setAuth({ isAuthenticated: false, user: null, token: null });
    
    // 2. LocalStorage 비우기
    localStorage.removeItem('sky_token');
    localStorage.removeItem('sky_user');
    
    // 3. 알림 및 이동
    alert('안전하게 로그아웃 되었습니다.');
    navigate('/');
  };

  // 데이터 로딩 중이거나 없는 경우의 기본값
  const displayUser = user || { nickname: '성도님', email: '로그인이 필요합니다', role: 'USER' };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto pt-4 pb-24 bg-[#F8FAFC] min-h-screen font-sans">
        
        {/* Profile Card - Premium Glassmorphism Style */}
        <div className="px-5 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A4173] to-[#2D5A9E] text-white rounded-[2rem] p-8 shadow-xl">
            {/* Subtle background pattern */}
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <span className="material-symbols-outlined text-[40px] text-white">person</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold tracking-tight">{displayUser.nickname}님</h2>
                  <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {displayUser.role === 'BIZ' ? 'PRO' : 'MEMBER'}
                  </span>
                </div>
                <p className="text-blue-100/80 text-sm font-medium">{displayUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Menu Sections */}
        <div className="px-5 space-y-6">
          
          {/* Section: Activity */}
          <div>
            <h3 className="px-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Service Menu</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/mypage/business-register" className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:translate-y-[-2px] transition-all duration-200">
                <div className="w-12 h-12 bg-blue-50 text-[#1A4173] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined font-light">storefront</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-base">사업장 등록 및 관리</h4>
                  <p className="text-slate-400 text-xs">일터를 등록하고 성도들과 소통하세요</p>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </Link>

              <button className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:translate-y-[-2px] transition-all duration-200 text-left w-full">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined font-light">favorite</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-base">관심 리스트</h4>
                  <p className="text-slate-400 text-xs">내가 찜한 사업장 모아보기</p>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Section: Support */}
          <div>
            <h3 className="px-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Settings</h3>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[22px]">manage_accounts</span>
                  <span className="text-[15px] font-semibold text-slate-700">프로필 수정</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[20px]">chevron_right</span>
              </button>
              <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[22px]">support_agent</span>
                  <span className="text-[15px] font-semibold text-slate-700">고객센터 / 문의</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[20px]">chevron_right</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full px-5 py-5 flex items-center justify-between hover:bg-rose-50 transition-colors text-rose-500 group text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">logout</span>
                  <span className="text-[15px] font-bold">안전하게 로그아웃</span>
                </div>
                <span className="material-symbols-outlined text-rose-300 text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center py-8 opacity-20 filter grayscale">
             <h2 className="text-xl font-black italic tracking-tighter text-[#1A4173]">SKY STEWARD</h2>
             <p className="text-[10px] uppercase tracking-widest mt-1">Premium Platform for Church Members</p>
          </div>
        </div>
        
      </main>
      <BottomNav />
    </>
  );
};

export default MyPage;
