import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import FavoriteButton from '../components/FavoriteButton';

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

  // Region Data (Mock)
  const regionData = {
    '서울': ['전체', '강남구', '서초구', '송파구', '마포구', '용산구', '종로구', '관악구', '동작구'],
    '경기': ['전체', '성남시 분당구', '성남시 수정구', '수원시', '용인시', '고양시', '부천시', '안양시'],
    '인천': ['전체', '연수구', '남동구', '부평구', '서구', '계양구'],
    '충청': ['전체', '천안시', '청주시', '아산시', '충주시', '당진시'],
    '경상': ['전체', '부산광역시', '대구광역시', '창원시', '울산광역시', '포항시'],
    '전라': ['전체', '광주광역시', '전주시', '여수시', '순천시', '익산시'],
    '강원': ['전체', '춘천시', '원주시', '강릉시', '속초시'],
    '제주': ['전체', '제주시', '서귀포시']
  };

  const provinces = ['전체', ...Object.keys(regionData)];
  const [selectedProvince, setSelectedProvince] = useState('전체');
  const [selectedDistrict, setSelectedDistrict] = useState('전체');

  // Fetch real data from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/business/category?id=${categoryId}`);
        const data = await res.json();
        if (data.success) {
            setBusinesses(data.businesses);
        }
      } catch (err) {
        console.error("Failed to fetch businesses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [categoryId]);

  // Handle Province Change
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('전체'); // Reset sub-district
  };

  const filteredBusinesses = businesses.filter(b => {
    // 1단계 도 필터
    if (selectedProvince !== '전체' && !b.address?.includes(selectedProvince)) return false;
    
    // 2단계 시/군/구 필터 (위치 문자열에 포함되는지 체크)
    if (selectedProvince !== '전체' && selectedDistrict !== '전체') {
      if (!b.address?.includes(selectedDistrict)) return false;
    }
    return true;
  });

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

        {/* 2-Step Region Dropdown Filters */}
        <div className="px-margin-mobile mb-6">
          <div className="flex gap-2">
            <select 
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="flex-1 w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              {provinces.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
            
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedProvince === '전체'}
              className="flex-1 w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none disabled:bg-surface-container disabled:text-outline"
            >
              {selectedProvince === '전체' ? (
                <option value="전체">전체 (시/도 먼저 선택)</option>
              ) : (
                regionData[selectedProvince]?.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Horizontal Business List */}
        <div className="px-margin-mobile flex flex-col gap-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-400 font-bold">사업장을 불러오는 중입니다...</p>
            </div>
          ) : filteredBusinesses.map((biz) => (
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
                  <FavoriteButton businessId={biz.id} />
                </div>
                
                <p className="text-[12px] text-primary font-semibold mb-1 truncate">
                  {biz.church_name}
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

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant text-body-md">
              해당 지역에 등록된 업체가 없습니다.
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
};

export default CategoryList;
