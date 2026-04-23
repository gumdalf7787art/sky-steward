import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
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
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto">
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
              { id: 'shopping', icon: 'shopping_bag', label: '쇼핑', bgCls: 'bg-amber-100', textCls: 'text-amber-700', fill: 1 },
              { id: 'marketing', icon: 'print', label: '인쇄/마케팅', bgCls: 'bg-purple-100', textCls: 'text-purple-700', fill: 1 },
              { id: 'online', icon: 'language', label: '온라인쇼핑', bgCls: 'bg-sky-100', textCls: 'text-sky-700', fill: 1 },
              { id: 'all', icon: 'grid_view', label: '전체보기', bgCls: 'bg-gray-200', textCls: 'text-gray-600', fill: 1 },
            ].map((cat, idx) => (
              <Link to={`/category/${cat.id}`} key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
                <div className={`w-14 h-14 rounded-full ${cat.bgCls} flex items-center justify-center ${cat.textCls}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${cat.fill}` }}>{cat.icon}</span>
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Businesses */}
        <section className="px-margin-mobile py-xl">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-primary">추천 업체</h3>
          </div>
          
          <div className="space-y-4">
            {/* Business Card 1 */}
            <div 
              onClick={() => navigate('/business/sample-biz-bakery')}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-40 w-full relative">
                <img alt="Cafe interior" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7dusOH9hUFr3oPfsKxNvuSyTeiDGrh7bikSBXpCRDiteKWfCyGZq-c8_kSiNfQt2KWN8b-8QpXIa1DHyP0dn5QEw2yFLu9cTmDSECGyIhLFAia_-F-1wAuim4fLFPyw7YwRQk50-6MGCmcFER9epQSChF4pbQiusxCPFa-POI4QEuWyLXCsG7gqB7aa_RHs3vDVXQlf329hwr3wagbjBeXvSrM-4Gx8vdi2o0M0CDF67FDjUZvUQW-Fynz8fmQDb_WXQn80WL-d4d"/>
                <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-label-lg font-bold">식당/카페</div>
              </div>
              <div className="p-md">
                <div className="flex justify-between items-start mb-xs">
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-surface">
                      은혜로운 베이커리
                      <span className="text-slate-400 font-medium text-[11px] ml-1.5 opacity-80">(이은혜 대표님)</span>
                    </h4>
                    <p className="text-body-md text-primary font-semibold">빛가온교회</p>
                  </div>
                  <span className="material-symbols-outlined text-outline">favorite</span>
                </div>
                <div className="flex items-center gap-1 text-outline mb-sm">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-label-lg">서울시 서초구 서초대로 123</span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-surface-container px-2 py-1 rounded text-label-sm text-on-surface-variant">#천연발효</span>
                  <span className="bg-surface-container px-2 py-1 rounded text-label-sm text-on-surface-variant">#단체주문환영</span>
                </div>
              </div>
            </div>

            {/* Business Card 2 */}
            <div 
              onClick={() => navigate('/business/sample-biz-math')}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-40 w-full relative">
                <img alt="Tutoring classroom" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6xOEl7DxQaEZqcJI-GcuhzbSKEQjpOIH4mRNhfLW3vslxEe-UzliiEcG9Z9KWBVmXPqV0QyQxdqnpfYPhEeNR9OkwpXA-xSWuc4HopJaXf730sUTVAfswP6uhWmpK1svH_eKJYpieifqd6O6pcgWk2Pz3Bc6eF_iEnca0JMdG6vPQAJCj2kyRbqks9N7liUy3ITiNmW5BHZ3GZeNmYl9cA9nXMkdR-YL_KyfPB1dhRTbdqnsn51MAlorIyJS3ZmLDXHzbz_w7b-3z"/>
                <div className="absolute top-3 left-3 bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-lg font-bold">학원/교육</div>
              </div>
              <div className="p-md">
                <div className="flex justify-between items-start mb-xs">
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-surface">
                      하늘 꿈 수학학원
                      <span className="text-slate-400 font-medium text-[11px] ml-1.5 opacity-80">(박수학 대표님)</span>
                    </h4>
                    <p className="text-body-md text-primary font-semibold">빛가온교회</p>
                  </div>
                  <span className="material-symbols-outlined text-outline">favorite</span>
                </div>
                <div className="flex items-center gap-1 text-outline mb-sm">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-label-lg">서울시 용산구 청파로 456</span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-surface-container px-2 py-1 rounded text-label-sm text-on-surface-variant">#초중고전문</span>
                  <span className="bg-surface-container px-2 py-1 rounded text-label-sm text-on-surface-variant">#1:1코칭</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2x2 Grid for Additional Businesses */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Additional Cards */}
            {[
              {
                id: 'biz-1',
                cat: '헤어/뷰티', bg: 'bg-pink-500', name: '사랑 헤어살롱', church: '빛가온교회',
                loc: '서초구 방배로', tag: '#천연염색',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHY02ixP4AbP_jMJFLbgZu0GPTfUjig3tf4nhvfq4j-hzgIaTNB_1xdGjh54I4ITdVukS8FnspgkzpZpMOJerXuoPbU-lpeM3sHSRdnIPwUc0vkzeoKEbtVAJqz2fSBrLW1txesPOPOP1Koug8JS4ReMKJKf6DzLu1Lw6JjOPKUlpj_xDbqm9Csn_viPAw-IDjxB02ImhKBPFtjZ4YC9KtAYMDpBhHD1o52PUSrCgfbpjv8K9ANUCzu9UnGFjcknywFjF5S03vln9s'
              },
              {
                id: 'biz-2',
                cat: '마트/식자재', bg: 'bg-green-600', name: '믿음 신선마트', church: '빛가온교회',
                loc: '관악구 신림동', tag: '#유기농',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm2YFYBJ8krGFEvaoHJ2-Fkd__ZZkKNErC4ceA6Q8c-eoNxIPlczkvxv6GIPw1UUMGCdrwMDxWKDOErbGISwgGgQHmGuTglu_KJnvvgKsepDoppNcrEYUDjV_Dvl2NmG3_p1-S2k8rm-Z7P0zEmDC1xVF0AIO4W8PRBS36leHBHtzvx1pro2G12MjugLfgnyUuupBBs9fPEvHPdeI6POAG3Hu5amsK3tJ-36kUXV57YMS8EVQHPFIWfNqhbcPgfit8AN6wGFDPo0qC'
              },
              {
                id: 'biz-3',
                cat: '병원/약국', bg: 'bg-error', name: '온유 내과의원', church: '빛가온교회',
                loc: '강남구 역삼로', tag: '#검진센터',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuLweLRNAU_uq8a7fRyIBia_cWhjbQY2HDB-jXe1DJcDefD6OrFCfulfdJ-q3ncsVkbblhBQKKosysLZX5jHp1708_qFoiakvpiAEe9TeqZ-lLh7f06Av55rFrcCVp9syaefMfAi3l1dpc2hjn8zJsY3Ycufkv59NCfeusqC4FjYjSwzSYLSC1fxPlYJ8maUsJc1uPESzgsZegSj97-eGYFpXukor7q52XowZKn8Qb9I5SXPgHALcW_2yQnPeXzhKEbL9S67aYASfJ'
              },
              {
                id: 'biz-4',
                cat: '인테리어', bg: 'bg-orange-600', name: '소망 인테리어', church: '빛가온교회',
                loc: '동작구 상도로', tag: '#리모델링',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeiY7DFH4cjLAU8oT2zwfogpDgD4uBAADuwpAI-ueosl45X1jdFdbMdkodRr4oLIq4_X8QN0z7ICxwNV5_iIcTV6rAodmeno29gzAZnJv2KJqf35Iei7mrTFig9iwScgOP_m0tukid3fi7nUq1pXmCPleg-l1k_Y56Px6JTYXjOaiAo3Ieatr0HPE91sUmhVhRBicaw0NiicjysY5g5O-wDoNqjjecgY7gJFJjnH6aGEO1_e3XmxdMhJKYTTULSBYzkKiAU25dxqE3'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-28 w-full relative">
                  <img alt={item.cat} className="w-full h-full object-cover" src={item.img}/>
                  <div className={`absolute top-2 left-2 ${item.bg} text-white px-2 py-0.5 rounded-full text-[10px] font-bold`}>{item.cat}</div>
                </div>
                <div className="p-3">
                  <h4 className="text-body-md font-bold text-on-surface truncate">
                    {item.name}
                    <span className="text-slate-400 font-medium text-[10px] ml-1 opacity-80">(대표님)</span>
                  </h4>
                  <p className="text-[11px] text-primary font-semibold mb-1">{item.church}</p>
                  <div className="flex items-center gap-0.5 text-outline mb-2">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span className="text-[10px] truncate">{item.loc}</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="bg-surface-container px-1 py-0.5 rounded text-[9px] text-on-surface-variant">{item.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Section */}
        <section className="px-margin-mobile py-10 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
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
