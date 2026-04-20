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
    const storedUser = localStorage.getItem('sky_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('sky_token');
    localStorage.removeItem('sky_user');
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  const displayUser = user || { nickname: '성도님', email: '로그인이 필요합니다', role: 'USER' };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto pt-4 pb-24 bg-[#F8FAFC] min-h-screen font-sans">
        
        {/* Profile Card */}
        <div className="px-5 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A4173] to-[#2D5A9E] text-white rounded-[2rem] p-8 shadow-xl">
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
        <div className="px-5 space-y-8">
          
          {/* Section: Service Menu */}
          <div>
            <h3 className="px-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Service Menu</h3>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <button className="w-full px-5 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-[#1A4173] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined font-light">manage_accounts</span>
                  </div>
                  <span className="text-[16px] font-bold text-slate-800">프로필 수정</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[20px]">chevron_right</span>
              </button>
              
              <button className="w-full px-5 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined font-light">favorite</span>
                  </div>
                  <span className="text-[16px] font-bold text-slate-800">관심 리스트</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Section: UPload */}
          <div>
            <h3 className="px-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">UPload</h3>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <Link to="/mypage/business-register" className="w-full px-5 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined font-light">storefront</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-base">사업자 등록 및 관리</h4>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[24px]">chevron_right</span>
              </Link>
            </div>
          </div>

          {/* Logout - Independent Button Style */}
          <div className="pt-4">
            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-white border border-rose-100 rounded-2xl flex items-center justify-center gap-3 text-rose-500 shadow-sm hover:bg-rose-50 transition-all duration-200 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
              <span className="text-[16px] font-bold">로그아웃</span>
            </button>
          </div>

          {/* Footer Branding */}
          <div className="text-center py-4 opacity-10 filter grayscale">
             <h2 className="text-xl font-black italic tracking-tighter text-[#1A4173]">SKY STEWARD</h2>
          </div>
        </div>
        
      </main>
      <BottomNav />
    </>
  );
};

export default MyPage;
