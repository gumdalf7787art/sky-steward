import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedBusinesses, setRecommendedBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categoryMap = {
    'restaurant': { icon: 'restaurant', label: '식당/카페', bgCls: 'bg-tertiary-fixed/40', textCls: 'text-tertiary', fill: 1, chipBg: 'bg-tertiary', chipText: 'text-on-tertiary' },
    'mart': { icon: 'shopping_cart', label: '마트/식자재', bgCls: 'bg-green-100', textCls: 'text-green-700', fill: 1, chipBg: 'bg-green-600', chipText: 'text-white' },
    'beauty': { icon: 'content_cut', label: '헤어/뷰티', bgCls: 'bg-pink-100', textCls: 'text-pink-600', fill: 1, chipBg: 'bg-pink-500', chipText: 'text-white' },
    'health': { icon: 'fitness_center', label: '스포츠/건강', bgCls: 'bg-blue-100', textCls: 'text-blue-700', fill: 1, chipBg: 'bg-blue-600', chipText: 'text-white' },
    'education': { icon: 'school', label: '학원/교육', bgCls: 'bg-secondary-fixed/40', textCls: 'text-secondary', fill: 1, chipBg: 'bg-secondary', chipText: 'text-on-secondary' },
    'medical': { icon: 'medical_services', label: '병원/약국', bgCls: 'bg-error-container', textCls: 'text-on-error-container', fill: 1, chipBg: 'bg-error', chipText: 'text-white' },
    'realestate': { icon: 'home_work', label: '부동산', bgCls: 'bg-primary-fixed/40', textCls: 'text-primary', fill: 1, chipBg: 'bg-primary', chipText: 'text-white' },
    'law': { icon: 'gavel', label: '법률/세무', bgCls: 'bg-indigo-100', textCls: 'text-indigo-700', fill: 1, chipBg: 'bg-indigo-600', chipText: 'text-white' },
    'car': { icon: 'directions_car', label: '자동차/정비', bgCls: 'bg-slate-200', textCls: 'text-slate-700', fill: 1, chipBg: 'bg-slate-600', chipText: 'text-white' },
    'interior': { icon: 'build', label: '인테리어/수리', bgCls: 'bg-orange-100', textCls: 'text-orange-700', fill: 1, chipBg: 'bg-orange-600', chipText: 'text-white' },
    'welfare': { icon: 'volunteer_activism', label: '요양/복지', bgCls: 'bg-teal-100', textCls: 'text-teal-700', fill: 1, chipBg: 'bg-teal-600', chipText: 'text-white' },
    'shopping': { icon: 'shopping_bag', label: '쇼핑/온라인', bgCls: 'bg-amber-100', textCls: 'text-amber-700', fill: 1, chipBg: 'bg-amber-600', chipText: 'text-white' },
    'marketing': { icon: 'print', label: '인쇄/마케팅', bgCls: 'bg-purple-100', textCls: 'text-purple-700', fill: 1, chipBg: 'bg-purple-600', chipText: 'text-white' },
    'finance': { icon: 'account_balance', label: '금융/보험', bgCls: 'bg-sky-100', textCls: 'text-sky-700', fill: 1, chipBg: 'bg-sky-600', chipText: 'text-white' },
  };

  const banners = [
    {
      title: "하나님 나라를 확장하는\n청지기 사업장을 응원합니다.",
      subtitle: "우리 교회 성도들이 운영하는 신뢰할 수 있는 업체",
      color: "bg-[#1A4173]",
      onColor: "text-white"
    },
    {
      title: "세상의 빛이 되는 일터\n하나님 나라의 가치를 경영합니다.",
      subtitle: "정직과 사랑으로 신뢰받는 우리 교회 청지기",
      color: "bg-[#0D9488]", // Teal
      onColor: "text-white"
    },
    {
      title: "사랑을 나누는 소비\n성도들의 일터를 든든히 세웁니다.",
      subtitle: "이웃 사랑의 실천, 가까운 교우의 사업장 이용부터",
      color: "bg-[#4338CA]", // Indigo
      onColor: "text-white"
    },
    {
      title: "일터에서 시작되는 축복\n성도들의 손길로 이어집니다.",
      subtitle: "믿음의 동역자가 운영하는 은혜로운 사업장",
      color: "bg-[#D97706]", // Amber
      onColor: "text-white"
    }
  ];

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch('/api/business/random');
        const data = await res.json();
        if (data.success) {
          setRecommendedBusinesses(data.businesses);
        }
      } catch (err) {
        console.error("Failed to fetch recommended businesses", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommended();

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <>
      <Header />
      <main className="w-full">
        {/* Search Bar Section */}
        <section className="px-margin-mobile pt-[17px] pb-[8px]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              className="w-full pl-11 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-lg" 
              placeholder="업종, 업체명, 교회명 검색" 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </section>

        {/* Hero Section */}
        <section className="px-margin-mobile pt-[8px] pb-[11px]">
          <div className={`relative overflow-hidden rounded-xl ${banners[currentBanner].color} transition-colors duration-700 flex flex-col justify-center px-6 py-8 min-h-[110px]`}>
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className={`relative z-10 ${banners[currentBanner].onColor}`}>
              <h2 
                key={`title-${currentBanner}`} 
                className="font-headline-sm text-headline-sm font-bold mb-0.5 whitespace-pre-line animate-[slideInRight_0.6s_ease-out]"
              >
                {banners[currentBanner].title}
              </h2>
              <p 
                key={`subtitle-${currentBanner}`}
                className="text-label-lg font-light opacity-90 animate-[slideInRight_0.6s_ease-out_0.1s_both]"
              >
                {banners[currentBanner].subtitle}
              </p>
            </div>
            
            {/* Pagination Indicators */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {banners.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentBanner === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="px-margin-mobile pt-[17px] pb-lg bg-slate-100">
          <div className="flex justify-between items-end mb-md">
            <h3 className="font-headline-md text-headline-md text-primary">업종별 찾기</h3>
          </div>
          <div className="grid gap-x-2 gap-y-5 grid-cols-5">
            {/* Category Items */}
            {[
              { id: 'restaurant', icon: 'restaurant', label: '식당/카페', bgCls: 'bg-tertiary-fixed/40', textCls: 'text-tertiary', fill: 1 },
              { id: 'mart', icon: 'shopping_cart', label: '마트/식자재', bgCls: 'bg-green-100', textCls: 'text-green-700', fill: 1 },
              { id: 'beauty', icon: 'content_cut', label: '헤어/뷰티', bgCls: 'bg-pink-100', textCls: 'text-pink-600', fill: 1 },
              { id: 'health', icon: 'fitness_center', label: '스포츠/건강', bgCls: 'bg-blue-100', textCls: 'text-blue-700', fill: 1 },
              { id: 'education', icon: 'school', label: '학원/교육', bgCls: 'bg-secondary-fixed/40', textCls: 'text-secondary', fill: 1 },
              { id: 'medical', icon: 'medical_services', label: '병원/약국', bgCls: 'bg-error-container', textCls: 'text-on-error-container', fill: 1 },
              { id: 'realestate', icon: 'home_work', label: '부동산', bgCls: 'bg-primary-fixed/40', textCls: 'text-primary', fill: 1 },
              { id: 'law', icon: 'gavel', label: '법률/세무', bgCls: 'bg-indigo-100', textCls: 'text-indigo-700', fill: 1 },
              { id: 'car', icon: 'directions_car', label: '자동차/정비', bgCls: 'bg-slate-200', textCls: 'text-slate-700', fill: 1 },
              { id: 'interior', icon: 'build', label: '인테리어/수리', bgCls: 'bg-orange-100', textCls: 'text-orange-700', fill: 1 },
              { id: 'welfare', icon: 'volunteer_activism', label: '요양/복지', bgCls: 'bg-teal-100', textCls: 'text-teal-700', fill: 1 },
              { id: 'shopping', icon: 'shopping_bag', label: '쇼핑/온라인', bgCls: 'bg-amber-100', textCls: 'text-amber-700', fill: 1 },
              { id: 'marketing', icon: 'print', label: '인쇄/마케팅', bgCls: 'bg-purple-100', textCls: 'text-purple-700', fill: 1 },
              { id: 'finance', icon: 'account_balance', label: '금융/보험', bgCls: 'bg-sky-100', textCls: 'text-sky-700', fill: 1 },
              { id: 'all', icon: 'grid_view', label: '전체보기', bgCls: 'bg-gray-200', textCls: 'text-gray-600', fill: 1 },
            ].map((cat, idx) => {
              if (cat.id === 'all') {
                return (
                  <Link to={`/category-explorer`} key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
                    <div className={`w-14 h-14 rounded-full ${cat.bgCls} flex items-center justify-center ${cat.textCls}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${cat.fill}` }}>{cat.icon}</span>
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">{cat.label}</span>
                  </Link>
                );
              }
              return (
                <Link to={`/category/${cat.id}`} key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
                  <div className={`w-14 h-14 rounded-full ${cat.bgCls} flex items-center justify-center ${cat.textCls}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${cat.fill}` }}>{cat.icon}</span>
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Businesses */}
        <section className="px-margin-mobile py-xl">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-primary">추천 업체</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recommendedBusinesses.length > 0 ? (
            <>
              {/* Big Cards (Top 2) */}
              <div className="space-y-4">
                {recommendedBusinesses.slice(0, 2).map((biz) => {
                  const cat = categoryMap[biz.category] || { label: biz.category, chipBg: 'bg-slate-500', chipText: 'text-white' };
                  const imageKeys = JSON.parse(biz.images || '[]');
                  const imageUrl = imageKeys.length > 0 ? (imageKeys[0].startsWith('http') ? imageKeys[0] : `/api/media/${imageKeys[0]}`) : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800';
                  const keywords = JSON.parse(biz.keywords || '[]');

                  return (
                    <div 
                      key={biz.id}
                      onClick={() => navigate(`/business/${biz.id}`)}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 w-full relative">
                        <img alt={biz.name} className="w-full h-full object-cover" src={imageUrl}/>
                        <div className={`absolute top-3 left-3 ${cat.chipBg} ${cat.chipText} px-3 py-1 rounded-full text-label-lg font-bold`}>{cat.label}</div>
                      </div>
                      <div className="p-md">
                        <div className="flex justify-between items-start mb-xs">
                          <div>
                            <h4 className="font-headline-md text-headline-md text-on-surface">
                              {biz.name}
                              <span className="text-slate-400 font-medium text-[11px] ml-1.5 opacity-80">({biz.ceo_name} 대표님)</span>
                            </h4>
                            <p className="text-body-md text-primary font-semibold">{biz.church_name || '우리교회'}</p>
                          </div>
                          <span className="material-symbols-outlined text-outline">favorite</span>
                        </div>
                        <div className="flex items-center gap-1 text-outline mb-sm">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          <span className="text-label-lg truncate">{biz.address}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="bg-surface-container px-2 py-1 rounded text-label-sm text-on-surface-variant">#{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Cards (Next 4) */}
              {recommendedBusinesses.length > 2 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {recommendedBusinesses.slice(2, 6).map((biz) => {
                    const cat = categoryMap[biz.category] || { label: biz.category, chipBg: 'bg-slate-500', chipText: 'text-white' };
                    const imageKeys = JSON.parse(biz.images || '[]');
                    const imageUrl = imageKeys.length > 0 ? (imageKeys[0].startsWith('http') ? imageKeys[0] : `/api/media/${imageKeys[0]}`) : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
                    const keywords = JSON.parse(biz.keywords || '[]');

                    return (
                      <div 
                        key={biz.id} 
                        onClick={() => navigate(`/business/${biz.id}`)}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="h-28 w-full relative">
                          <img alt={biz.name} className="w-full h-full object-cover" src={imageUrl}/>
                          <div className={`absolute top-2 left-2 ${cat.chipBg} ${cat.chipText} px-2 py-0.5 rounded-full text-[10px] font-bold`}>{cat.label}</div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-body-md font-bold text-on-surface truncate">
                            {biz.name}
                            <span className="text-slate-400 font-medium text-[10px] ml-1 opacity-80">({biz.ceo_name})</span>
                          </h4>
                          <p className="text-[11px] text-primary font-semibold mb-1">{biz.church_name || '우리교회'}</p>
                          <div className="flex items-center gap-0.5 text-outline mb-2">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            <span className="text-[10px] truncate">{biz.address.split(' ').slice(0, 2).join(' ')}</span>
                          </div>
                          <div className="flex gap-1 overflow-hidden">
                            {keywords.slice(0, 1).map((kw, i) => (
                              <span key={i} className="bg-surface-container px-1 py-0.5 rounded text-[9px] text-on-surface-variant">#{kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center text-slate-400 text-sm">
              등록된 업체가 없습니다.
            </div>
          )}
        </section>

        {/* Footer Section */}
        <section className="px-margin-mobile py-10 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="w-full">
            <div className="flex flex-col space-y-2">
              <h4 className="text-body-lg font-bold text-slate-800 dark:text-slate-200">블루프라임</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-label-lg text-slate-500 dark:text-slate-400">
                <p>대표 : 김덕규</p>
                <p>사업자등록번호 : 153-87-03544</p>
              </div>
              <p className="text-label-md text-slate-400 dark:text-slate-500 pt-4">
                Copyright © BluePrime. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
};

export default Home;
