import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const CategoryList = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
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

  // Handle Province Change
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('전체'); // Reset sub-district
  };

  // Mock Data for Horizontal Cards
  const mockBusinesses = [
    {
      id: 1,
      name: '은혜로운 베이커리',
      church: '빛가온교회',
      location: '서울 서초구 서초대로 123',
      region: '서울',
      tags: ['#천연발효', '#단체주문환영'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7dusOH9hUFr3oPfsKxNvuSyTeiDGrh7bikSBXpCRDiteKWfCyGZq-c8_kSiNfQt2KWN8b-8QpXIa1DHyP0dn5QEw2yFLu9cTmDSECGyIhLFAia_-F-1wAuim4fLFPyw7YwRQk50-6MGCmcFER9epQSChF4pbQiusxCPFa-POI4QEuWyLXCsG7gqB7aa_RHs3vDVXQlf329hwr3wagbjBeXvSrM-4Gx8vdi2o0M0CDF67FDjUZvUQW-Fynz8fmQDb_WXQn80WL-d4d'
    },
    {
      id: 2,
      name: '소망의 뜰 한정식',
      church: '빛가온교회',
      location: '경기 성남시 분당구 수내동',
      region: '경기',
      tags: ['#상견례', '#룸완비', '#가족모임'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCWb8M9Wc7b-_fU8hKzHw-KkZ7Q_rR5N-qXlZ6zQhKqC5D8j4L-x1kC9H8zY8T0J6G-O2Fw5vW8xUqL7N_mX2GZ6H4W_qT8xUqL7N_mX2GZ6H4W_qT8xUqL7N_mX2GZ6H4' 
    },
    {
      id: 3,
      name: '믿음 커피로스터스',
      church: '사랑누리교회',
      location: '서울 마포구 홍익로 45',
      region: '서울',
      tags: ['#핸드드립', '#스페셜티', '#주차가능'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHY02ixP4AbP_jMJFLbgZu0GPTfUjig3tf4nhvfq4j-hzgIaTNB_1xdGjh54I4ITdVukS8FnspgkzpZpMOJerXuoPbU-lpeM3sHSRdnIPwUc0vkzeoKEbtVAJqz2fSBrLW1txesPOPOP1Koug8JS4ReMKJKf6DzLu1Lw6JjOPKUlpj_xDbqm9Csn_viPAw-IDjxB02ImhKBPFtjZ4YC9KtAYMDpBhHD1o52PUSrCgfbpjv8K9ANUCzu9UnGFjcknywFjF5S03vln9s'
    }
  ];

  const filteredBusinesses = mockBusinesses.filter(b => {
    // 1단계 도 필터
    if (selectedProvince !== '전체' && b.region !== selectedProvince) return false;
    
    // 2단계 시/군/구 필터 (위치 문자열에 포함되는지 체크)
    if (selectedProvince !== '전체' && selectedDistrict !== '전체') {
      // "경기 성남시 분당구 수내동" includes "성남시 분당구"
      if (!b.location.includes(selectedDistrict)) return false;
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
          {filteredBusinesses.map((biz) => (
            <div key={biz.id} className="flex bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all h-[110px]">
              
              {/* Left Image Square */}
              <div className="w-[110px] min-w-[110px] h-full relative bg-gray-200 flex-shrink-0">
                <img 
                  src={biz.image} 
                  alt={biz.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                />
              </div>

              {/* Right Content Area */}
              <div className="flex flex-col justify-center p-3 w-full overflow-hidden">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-headline-md text-body-lg text-on-surface truncate font-bold">{biz.name}</h4>
                  <button className="text-outline hover:text-primary"><span className="material-symbols-outlined text-[20px]">bookmark_border</span></button>
                </div>
                
                <p className="text-[12px] text-primary font-semibold mb-1 truncate">{biz.church}</p>
                
                <div className="flex items-center gap-1 text-outline mb-1.5 text-[11px] truncate w-full">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="truncate">{biz.location}</span>
                </div>
                
                <div className="flex gap-1 overflow-x-auto hide-scrollbar min-w-max">
                  {biz.tags.map((tag, idx) => (
                    <span key={idx} className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] text-on-surface-variant whitespace-nowrap">
                      {tag}
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
