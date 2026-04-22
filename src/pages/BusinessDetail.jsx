import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const BusinessDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const auth = useRecoilValue(authState);
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const [showMapModal, setShowMapModal] = useState(false);
    const [showMenuBoard, setShowMenuBoard] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Review Modal States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    // Refs for sequential scroll
    const homeRef = useRef(null);
    const menuRef = useRef(null);
    const reviewRef = useRef(null);

    const fetchDetail = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        fetchDetail();
        window.scrollTo(0, 0);
    }, [fetchDetail]);

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
        const addressDetail = data.business.address_detail || '';
        const fullAddress = `${address} ${addressDetail}`.trim();
        const name = data.business.name;
        if (!address) {
            alert("등록된 주소 정보가 없습니다.");
            return;
        }

        let url = "";
        switch (type) {
            case 'naver':
                url = `https://map.naver.com/v5/search/${encodeURIComponent(fullAddress)}`;
                break;
            case 'kakao':
                url = `https://map.kakao.com/link/search/${encodeURIComponent(fullAddress)}`;
                break;
            case 'google':
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + " " + name)}`;
                break;
            default:
                return;
        }
        window.open(url, "_blank");
        setShowMapModal(false);
    };

    const handleOpenReviewModal = () => {
        if (!auth.isAuthenticated) {
            if (confirm("리뷰를 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
                navigate('/login');
            }
            return;
        }
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!newComment.trim()) {
            alert("리뷰 내용을 입력해 주세요.");
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    business_id: id,
                    rating: newRating,
                    comment: newComment
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("리뷰가 소중하게 등록되었습니다. 감사합니다!");
                setShowReviewModal(false);
                setNewComment('');
                setNewRating(5);
                fetchDetail(); // Refresh data
                // Scroll to review section to see the new review
                setTimeout(() => scrollToSection(reviewRef, 'review'), 500);
            } else {
                alert(result.error || "리뷰 등록 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("서버 통신 오류가 발생했습니다.");
        } finally {
            setSubmittingReview(false);
        }
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
        <div className="bg-slate-50 min-h-screen pb-40 relative">
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

            {/* 1. TOP: Image Swiper Section (Enhanced) */}
            <div className="max-w-md mx-auto relative group">
                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                    {images.length > 0 ? (
                        <>
                            <img 
                                src={`/api/media/${images[currentImageIndex]}`} 
                                alt={data.business.name} 
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                            
                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button 
                                        onClick={() => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[48px]">image</span>
                            <p className="text-xs font-bold mt-2 italic opacity-60">이미지가 없습니다</p>
                        </div>
                    )}
                    
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold tracking-widest uppercase">
                    {currentImageIndex + 1} / {images.length || 1}
                    </div>
                </div>

                {/* Thumbnail List (Horizontal Scroll) */}
                {images.length > 1 && (
                    <div className="bg-white border-b border-slate-100 px-4 py-3">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
                            {images.map((img, index) => (
                                <div 
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden cursor-pointer transition-all ${
                                        currentImageIndex === index 
                                            ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-md' 
                                            : 'opacity-50 grayscale-[50%] hover:opacity-100'
                                    }`}
                                >
                                    <img src={`/api/media/${img}`} className="w-full h-full object-cover" alt={`썸네일 ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                                <p className="text-sm font-bold text-primary flex items-center gap-1.5 leading-relaxed">
                                    <span className="material-symbols-outlined text-[16px]">church</span>
                                    <span>
                                        {data.business.church_name || "소속교회 정보 없음"}
                                        {data.business.ceo_name && <span className="text-slate-400 font-medium ml-1">({data.business.ceo_name} 대표님)</span>}
                                    </span>
                                </p>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {data.business.description || "등록된 소개글이 없습니다. 하나님 나라를 꿈꾸는 정직한 청지기 사업장입니다."}
                            </p>
                        </div>

                        <div className="bg-slate-100/50 p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 mt-0.5">location_on</span>
                                <div className="space-y-0.5">
                                    <p className="text-[13px] font-black text-slate-800">사업체 위치</p>
                                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                        {data.business.address || "정보 없음"}
                                        {data.business.address_detail && <span className="block text-slate-400 text-[11px] mt-0.5">{data.business.address_detail}</span>}
                                    </p>
                                </div>
                            </div>
                            
                            {data.business.operating_hours && (
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400 mt-0.5">schedule</span>
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-black text-slate-800">영업 시간</p>
                                        <p className="text-[12px] text-slate-500 font-medium">{data.business.operating_hours}</p>
                                    </div>
                                </div>
                            )}

                            {data.business.parking_info && (
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400 mt-0.5">local_parking</span>
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-black text-slate-800">주차 정보</p>
                                        <p className="text-[12px] text-slate-500 font-medium">{data.business.parking_info}</p>
                                    </div>
                                </div>
                            )}
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
                        {data.business.menu_board_image && (
                            <button 
                                onClick={() => setShowMenuBoard(true)}
                                className="text-[11px] font-black text-slate-400 border-b border-slate-200 pb-0.5"
                            >
                                메뉴판 이미지 보기
                            </button>
                        )}
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
                                                ) : (review.user_nickname?.charAt(0) || "?")}
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

                    {/* Review Writing Button (Static at the bottom of review section) */}
                    <div className="pt-8 pb-12 flex justify-center">
                        <button 
                            onClick={handleOpenReviewModal}
                            className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full max-w-[280px] justify-center"
                        >
                            <span className="material-symbols-outlined">edit_square</span>
                            리뷰 작성하기
                        </button>
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

            {/* Review Writing Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 sm:items-center sm:p-0">
                    <div 
                        className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-sm" 
                        onClick={() => !submittingReview && setShowReviewModal(false)}
                    ></div>
                    <div className="relative w-full max-w-sm overflow-hidden transition-all transform bg-white rounded-[2.5rem] shadow-2xl animate-[slideInUp_0.3s_ease-out]">
                        <div className="px-6 pt-8 pb-10 space-y-6">
                            <div className="space-y-1 text-center">
                                <h3 className="text-xl font-black text-slate-900 leading-none">리뷰 작성하기</h3>
                                <p className="text-[13px] text-slate-400 font-bold tracking-tight">이용 경험을 공유해 주세요!</p>
                            </div>
                            
                            {/* Star Rating Selector */}
                            <div className="flex justify-center gap-2 py-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setNewRating(star)}
                                        className="focus:outline-none active:scale-125 transition-transform"
                                    >
                                        <span className={`material-symbols-outlined text-[40px] ${star <= newRating ? 'text-amber-400 fill-1' : 'text-slate-100'}`}>
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="사장님과 다른 성도님들께 남기고 싶은 한마디!"
                                    className="w-full h-32 p-4 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium resize-none placeholder:text-slate-300"
                                />
                                <div className="flex gap-2">
                                    <button 
                                        disabled={submittingReview}
                                        onClick={() => setShowReviewModal(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[13px] active:scale-95 transition-all"
                                    >
                                        취소
                                    </button>
                                    <button 
                                        disabled={submittingReview}
                                        onClick={handleSubmitReview}
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[13px] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {submittingReview ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                                                등록하기
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Board Modal */}
            {showMenuBoard && data.business.menu_board_image && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowMenuBoard(false)}></div>
                    <div className="relative max-w-lg w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-[zoomIn_0.3s_ease-out]">
                        <div className="flex items-center justify-between p-6 border-b border-slate-50">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">menu_book</span>
                                메뉴판 크게보기
                            </h3>
                            <button onClick={() => setShowMenuBoard(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="p-2 bg-slate-50 max-h-[70vh] overflow-y-auto">
                            <img 
                                src={`/api/media/${data.business.menu_board_image}`} 
                                className="w-full h-auto rounded-xl"
                                alt="Menu Board"
                            />
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-[11px] font-bold text-slate-400 italic">메뉴 정보는 당사 사정에 따라 변경될 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default BusinessDetail;
