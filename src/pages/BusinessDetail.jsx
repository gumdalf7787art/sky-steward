import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const BusinessDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const [showMapModal, setShowMapModal] = useState(false);

    // Refs for sequential scroll
    const homeRef = useRef(null);
    const menuRef = useRef(null);
    const reviewRef = useRef(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/business/${id}`);
                const json = await res.json();
                if (json.success) {
                    setData(json);
                }
            } catch (err) {
                console.error("Failed to fetch business detail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        window.scrollTo(0, 0);
    }, [id]);

    const scrollToSection = (ref, tabName) => {
        setActiveTab(tabName);
        if (ref.current) {
            const headerOffset = 110; // Adjust based on header/tab height
            const elementPosition = ref.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Scroll Spy effect to update active tab based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + 120;
            if (reviewRef.current && scrollPos >= reviewRef.current.offsetTop) {
                setActiveTab('review');
            } else if (menuRef.current && scrollPos >= menuRef.current.offsetTop) {
                setActiveTab('menu');
            } else {
                setActiveTab('home');
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openMapApp = (type) => {
        const address = data.business.address;
        const name = data.business.name;
        if (!address) {
            alert("등록된 주소 정보가 없습니다.");
            return;
        }

        let url = "";
        switch (type) {
            case 'naver':
                url = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
                break;
            case 'kakao':
                url = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
                break;
            case 'google':
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " " + name)}`;
                break;
            default:
                return;
        }
        window.open(url, "_blank");
        setShowMapModal(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium tracking-tight">사업장 정보를 불러오고 있습니다...</p>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <span className="material-symbols-outlined text-rose-400 text-[48px] mb-4">error</span>
            <p className="text-slate-600 font-bold">오류가 발생했습니다.</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-full text-sm font-bold shadow-lg">뒤로가기</button>
        </div>
    );

    const images = data.business.images ? JSON.parse(data.business.images) : [];
    
    return (
        <div className="bg-slate-50 min-h-screen pb-32 relative">
            <Header />
            
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-800">arrow_back</span>
                </button>
                <div className="flex gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-800">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-800">
                        <span className="material-symbols-outlined">favorite</span>
                    </button>
                </div>
            </div>

            {/* 1. TOP: Image Swiper Section (Relative) */}
            <div className="max-w-md mx-auto aspect-[4/3] bg-slate-200 relative overflow-hidden group">
                {images.length > 0 ? (
                    <img 
                        src={`/api/media/${images[0]}`} 
                        alt={data.business.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[48px]">image</span>
                        <p className="text-xs font-bold mt-2 italic opacity-60">이미지가 없습니다</p>
                    </div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold tracking-widest uppercase">
                   1 / {images.length || 1}
                </div>
            </div>

            {/* 2. MIDDLE: Tab Bar (Sticky below Action Bar) */}
            <div className="sticky top-[53px] z-30 bg-white border-b border-slate-100 flex shadow-sm">
                <button 
                    onClick={() => scrollToSection(homeRef, 'home')}
                    className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'home' ? 'text-primary' : 'text-slate-400'}`}
                >
                    홈
                    {activeTab === 'home' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => scrollToSection(menuRef, 'menu')}
                    className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'menu' ? 'text-primary' : 'text-slate-400'}`}
                >
                    메뉴
                    {activeTab === 'menu' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => scrollToSection(reviewRef, 'review')}
                    className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'review' ? 'text-primary' : 'text-slate-400'}`}
                >
                    리뷰
                    {activeTab === 'review' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                </button>
            </div>

            <main className="max-w-md mx-auto">
                {/* 3. CONTENT: Home Section */}
                <section ref={homeRef} id="home" className="space-y-6 pt-6">
                    {/* Basic Info Card */}
                    <div className="px-5 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-md uppercase tracking-tight">{data.business.category}</span>
                                <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px] fill-1">star</span>
                                    {data.stats.avgRating.toFixed(1)}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">{data.business.name}</h2>
                            <p className="text-primary font-black flex items-center gap-1 text-[13px] hover:underline cursor-pointer group">
                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">church</span>
                                {data.business.church_name || "소속교회 정보 없음"}
                            </p>
                        </div>

                        {/* Call Button Group */}
                        <div className="flex gap-2">
                            {data.business.show_phone === 1 && data.business.phone && (
                                <a href={`tel:${data.business.phone}`} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                    전화 문의
                                </a>
                            )}
                            <button 
                                onClick={() => setShowMapModal(true)}
                                className={`${(data.business.show_phone === 1 && data.business.phone) ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-4 bg-white border border-slate-100 text-slate-800 rounded-2xl font-black shadow-sm active:scale-[0.98] transition-all`}
                            >
                                <span className="material-symbols-outlined text-[20px]">near_me</span>
                                길찾기
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-[1px] bg-slate-100 w-full" />

                        {/* Intro / Details */}
                        <div className="space-y-3">
                            <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                                업체 소개
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {data.business.description || "등록된 소개글이 없습니다. 하나님 나라를 꿈꾸는 정직한 청지기 사업장입니다."}
                            </p>
                        </div>

                        <div className="bg-slate-100/50 p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 mt-0.5">location_on</span>
                                <div className="space-y-0.5">
                                    <p className="text-[13px] font-black text-slate-800">사업체 위치</p>
                                    <p className="text-[12px] text-slate-500 font-medium">{data.business.address || "정보 없음"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 mt-0.5">schedule</span>
                                <div className="space-y-0.5">
                                    <p className="text-[13px] font-black text-slate-800">영업 시간</p>
                                    <p className="text-[12px] text-slate-500 font-medium uppercase tracking-tight italic">등록된 영업시간 정보가 없습니다.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 mt-0.5">local_parking</span>
                                <div className="space-y-0.5">
                                    <p className="text-[13px] font-black text-slate-800">주차 정보</p>
                                    <p className="text-[12px] text-slate-500 font-medium">주차 가능 여부를 확인하려면 전화 문의 부탁드립니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-4 bg-slate-100 my-8" />

                {/* Menu Section */}
                <section ref={menuRef} id="menu" className="px-5 space-y-6 scroll-mt-24">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-[24px]">restaurant_menu</span>
                            추천 메뉴
                        </h3>
                        <button className="text-[11px] font-black text-slate-400 border-b border-slate-200 pb-0.5">메뉴판 이미지 보기</button>
                    </div>

                    <div className="space-y-4">
                        {data.menus && data.menus.length > 0 ? (
                            data.menus.map((menu) => (
                                <div key={menu.id} className="group bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-lg hover:border-transparent transition-all cursor-pointer overflow-hidden shadow-sm">
                                    <div className="space-y-1 overflow-hidden">
                                        <h4 className="font-black text-slate-800 group-hover:text-primary transition-colors">{menu.name}</h4>
                                        <p className="text-xs text-slate-400 font-bold truncate pr-4">{menu.description || "청지기의 마음을 담아 정직하게 준비했습니다."}</p>
                                        <p className="text-sm font-black text-slate-900 mt-1">{menu.price || "가격 문의"}</p>
                                    </div>
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-slate-200">restaurant</span>
                                        {menu.image_key && <img src={`/api/media/${menu.image_key}`} className="w-full h-full object-cover relative z-10" />}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                                <span className="material-symbols-outlined text-slate-200 text-[48px] mb-2">menu_book</span>
                                <p className="text-xs text-slate-400 font-bold">등록된 메뉴가 아직 없습니다.</p>
                            </div>
                        )}
                    </div>
                </section>

                <div className="h-4 bg-slate-100 my-8" />

                {/* Review Section */}
                <section ref={reviewRef} id="review" className="px-5 space-y-6 pb-20 scroll-mt-24">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500 text-[24px]">chat_bubble</span>
                            방문 리뷰
                            <span className="text-[13px] font-black text-slate-300 ml-1">{data.stats.reviewCount}</span>
                        </h3>
                        <div className="flex items-center gap-1 text-[13px] font-black text-slate-900">
                             <span className="material-symbols-outlined text-rose-500 text-[18px] fill-1">star</span>
                             {data.stats.avgRating.toFixed(1)}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {data.reviews && data.reviews.length > 0 ? (
                            data.reviews.map((review) => (
                                <div key={review.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-300 font-black text-xs border border-slate-50 shadow-sm">
                                                {review.user_image ? (
                                                    <img src={`/api/media/${review.user_image}`} className="w-full h-full object-cover" />
                                                ) : review.user_nickname?.charAt(0)}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[13px] font-black text-slate-800">{review.user_nickname}</p>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`material-symbols-outlined text-[13px] ${i < review.rating ? 'text-amber-400 fill-1' : 'text-slate-200'}`}>star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-50 shadow-sm shadow-slate-100/50">
                                        {review.comment}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <span className="material-symbols-outlined text-slate-200 text-[64px] mb-3">forum</span>
                                <p className="text-sm text-slate-400 font-bold">아직 작성된 리뷰가 없습니다.<br/><span className="text-primary/60">첫 번째 청지기 단골이 되어주세요!</span></p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Map Selection Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 sm:items-center sm:p-0">
                    <div 
                        className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-sm" 
                        onClick={() => setShowMapModal(false)}
                    ></div>
                    <div className="relative w-full max-w-sm overflow-hidden transition-all transform bg-white rounded-[2.5rem] shadow-2xl animate-[slideInUp_0.3s_ease-out]">
                        <div className="px-6 pt-8 pb-10 space-y-6">
                            <div className="space-y-1 text-center">
                                <h3 className="text-xl font-black text-slate-900 leading-none">길찾기 앱 선택</h3>
                                <p className="text-[13px] text-slate-400 font-bold capitalize tracking-tight">이동하실 지도 앱을 선택해 주세요</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => openMapApp('naver')}
                                    className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 transition-all active:scale-95 group"
                                >
                                    <div className="w-14 h-14 bg-[#03C75A] rounded-2xl flex items-center justify-center shadow-lg shadow-[#03C75A]/20 transition-transform group-hover:rotate-12">
                                        <span className="text-white font-black text-xl">N</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-700">네이버 지도</span>
                                </button>
                                <button 
                                    onClick={() => openMapApp('kakao')}
                                    className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 transition-all active:scale-95 group"
                                >
                                    <div className="w-14 h-14 bg-[#FAE100] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FAE100]/20 transition-transform group-hover:-rotate-12">
                                        <span className="text-slate-900 font-black text-lg">K</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-700">카카오맵</span>
                                </button>
                                <button 
                                    onClick={() => openMapApp('google')}
                                    className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 transition-all active:scale-95 group"
                                >
                                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-[#EA4335]">map</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-700">구글 지도</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowMapModal(false)}
                                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[13px] hover:bg-slate-200 transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default BusinessDetail;
