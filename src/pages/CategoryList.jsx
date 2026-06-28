import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const CategoryList = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL id to Korean Title mapping mockup
  const getCategoryTitle = (id) => {
    const titles = {
      restaurant: '식당/카페',
      mart: '마트/식자재',
      beauty: '헤어/뷰티',
      health: '스포츠/건강',
      education: '학원/교육',
      medical: '병원/약국',
      realestate: '부동산',
      law: '법률/세무',
      car: '자동차/정비',
      interior: '인테리어/수리',
      welfare: '요양/복지',
      shopping: '쇼핑',
      marketing: '인쇄/마케팅',
      online: '온라인쇼핑',
    };
    return titles[id] || '업체 목록';
  };

  const title = getCategoryTitle(categoryId);



  // Fetch real data from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('sky_token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/business/category?id=${categoryId}`, { headers });
        const data = await res.json();
        if (data.success) {
            setBusinesses(data.businesses);
        }
      } catch (err) {
        console.error("Failed to fetch category businesses", err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchBusinesses();
    }
  }, [categoryId]);



  return (
    <>
      <Header />
      <main className="max-w-md mx-auto pt-4 pb-24 bg-surface">
        
        {/* Page Header */}
        <div className="px-margin-mobile flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="mr-3 text-on-surface">
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
          </button>
          <h2 className="text-headline-md font-headline-md text-primary">{title}</h2>
        </div>



        {/* Horizontal Business List */}
        <div className="px-margin-mobile flex flex-col gap-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-400 font-bold">사업장을 불러오는 중입니다...</p>
            </div>
          ) : businesses.map((biz) => (
            <div 
              key={biz.id} 
              onClick={() => navigate(`/business/${biz.id}`)}
              className="flex bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all h-[110px]"
            >
              
              {/* Left Image Square */}
              <div className="w-[110px] min-w-[110px] h-full relative bg-gray-200 flex-shrink-0">
                <img 
                  src={biz.images && biz.images.length > 0 ? `/api/media/${biz.images[0]}` : 'https://via.placeholder.com/150?text=No+Image'} 
                  alt={biz.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                />
              </div>

              {/* Right Content Area */}
              <div className="flex flex-col justify-center p-3 w-full overflow-hidden">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-headline-md text-body-lg text-on-surface truncate font-bold">
                    {biz.name}
                    {biz.ceo_name && <span className="text-slate-400 font-medium text-[11px] ml-1.5 opacity-80">({biz.ceo_name} 대표님)</span>}
                  </h4>
                  <button 
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      const token = localStorage.getItem('sky_token');
                      if (!token) {
                          if (confirm("관심 업체로 등록하려면 로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
                              navigate('/login');
                          }
                          return;
                      }

                      try {
                          const res = await fetch('/api/bookmarks/toggle', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ businessId: biz.id })
                          });
                          const data = await res.json();
                          if (data.success) {
                              setBusinesses(prev => prev.map(item => 
                                  item.id === biz.id ? { ...item, isBookmarked: data.bookmarked } : item
                              ));
                          }
                      } catch (err) {
                          console.error("Failed to toggle bookmark", err);
                      }
                    }} 
                    className={`hover:scale-110 transition-transform ${biz.isBookmarked ? 'text-rose-500' : 'text-outline hover:text-primary'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${biz.isBookmarked ? 'fill-1' : ''}`}>favorite</span>
                  </button>
                </div>
                
                <p className="text-[12px] text-primary font-semibold mb-1 truncate">
                  {"빛가온교회"}
                </p>
                
                <div className="flex items-center gap-1 text-outline mb-1.5 text-[11px] truncate w-full">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="truncate">{biz.address}</span>
                </div>
                
                <div className="flex gap-1 overflow-x-auto hide-scrollbar min-w-max">
                  {biz.keywords?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] text-on-surface-variant whitespace-nowrap">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {businesses.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant text-body-md">
              해당 업종에 등록된 업체가 없습니다.
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default CategoryList;
