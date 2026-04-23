import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const CategoryExplorer = () => {
  const navigate = useNavigate();

  const categoryGroups = [
    {
      title: "교회/기독서비스",
      icon: "church",
      color: "text-amber-600",
      bg: "bg-amber-50",
      items: [
        { id: 'church-facility', label: '교회시설/시공', icon: 'construction' },
        { id: 'sacred-goods', label: '성구사/목공예', icon: 'chair' },
        { id: 'christian-book', label: '기독교서점', icon: 'menu_book' },
        { id: 'av-system', label: '음향/영상/LED', icon: 'settings_input_component' },
        { id: 'mission-goods', label: '선교/전도용품', icon: 'redeem' },
        { id: 'choir-robe', label: '성가복/가운', icon: 'styler' },
      ]
    },
    {
      title: "식음료/생활",
      icon: "restaurant",
      color: "text-rose-600",
      bg: "bg-rose-50",
      items: [
        { id: 'restaurant', label: '일반음식점', icon: 'restaurant' },
        { id: 'cafe', label: '카페/디저트', icon: 'local_cafe' },
        { id: 'mart', label: '마트/식자재', icon: 'shopping_cart' },
        { id: 'beauty', label: '헤어/뷰티', icon: 'content_cut' },
        { id: 'shopping', label: '쇼핑/온라인', icon: 'shopping_bag' },
        { id: 'fashion', label: '의류/패션', icon: 'checkroom' },
        { id: 'laundry', label: '세탁/수선', icon: 'local_laundry_service' },
      ]
    },
    {
      title: "의료/복지/실버",
      icon: "medical_services",
      color: "text-teal-600",
      bg: "bg-teal-50",
      items: [
        { id: 'medical', label: '병원/의원', icon: 'medical_services' },
        { id: 'pharmacy', label: '약국', icon: 'medication' },
        { id: 'welfare', label: '요양/사회복지', icon: 'volunteer_activism' },
        { id: 'funeral', label: '상조/장례', icon: 'church' },
        { id: 'health', label: '스포츠/헬스', icon: 'fitness_center' },
      ]
    },
    {
      title: "교육/비즈니스",
      icon: "school",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      items: [
        { id: 'education', label: '학원/교육', icon: 'school' },
        { id: 'finance', label: '금융/보험', icon: 'account_balance' },
        { id: 'law', label: '법률/회계/세무', icon: 'gavel' },
        { id: 'marketing', label: '관리/마케팅', icon: 'campaign' },
        { id: 'it-service', label: 'IT/컴퓨터', icon: 'desktop_windows' },
        { id: 'print', label: '인쇄/출판', icon: 'print' },
      ]
    },
    {
      title: "시설/주거/차량",
      icon: "home_work",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      items: [
        { id: 'interior', label: '인테리어/시공', icon: 'format_paint' },
        { id: 'realestate', label: '부동산/임대', icon: 'home_work' },
        { id: 'cleaning', label: '이사/청소/방역', icon: 'cleaning_services' },
        { id: 'car', label: '자동차/정비', icon: 'directions_car' },
        { id: 'flower', label: '꽃/조경', icon: 'local_florist' },
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Header />
      
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-slate-800">arrow_back</span>
        </button>
        <h1 className="ml-2 font-bold text-slate-900 text-xl">카테고리 사전</h1>
      </div>

      <main className="max-w-md mx-auto px-5 py-6">
        <p className="text-slate-500 text-sm mb-8">원하시는 업종을 선택하시면<br/>관련 청지기 사업장을 찾아드립니다.</p>

        <div className="space-y-10">
          {categoryGroups.map((group, gIdx) => (
            <section key={gIdx}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg ${group.bg} ${group.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[18px]">{group.icon}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{group.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {group.items.map((item, iIdx) => (
                  <button 
                    key={iIdx}
                    onClick={() => navigate(`/category/${item.id}`)}
                    className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.97]"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[24px]">{item.icon}</span>
                    <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CategoryExplorer;
