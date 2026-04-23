import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Favorites = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookmarks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('로그인이 필요한 서비스입니다.');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/bookmarks/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setBookmarks(data.bookmarks);
            } else {
                setError(data.error || '목록을 불러오지 못했습니다.');
            }
        } catch (err) {
            console.error('Failed to fetch bookmarks', err);
            setError('서버 통신 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const toggleBookmark = async (e, businessId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch('/api/bookmarks/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ businessId })
            });
            const data = await res.json();
            if (data.success) {
                // Remove from list if unbookmarked
                setBookmarks(prev => prev.filter(b => b.id !== businessId));
            }
        } catch (err) {
            console.error('Failed to toggle bookmark', err);
        }
    };

    const BusinessCard = ({ biz }) => {
        let firstImage = null;
        if (biz.images) {
            try {
                const imagesArr = typeof biz.images === 'string' ? JSON.parse(biz.images) : biz.images;
                if (Array.isArray(imagesArr) && imagesArr.length > 0) {
                    firstImage = imagesArr[0];
                }
            } catch (e) {
                console.error(e);
            }
        }

        return (
            <div 
                onClick={() => navigate(`/business/${biz.id}`)}
                className="flex bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all h-[110px]"
            >
                <div className="w-[110px] min-w-[110px] h-full relative bg-slate-100 flex-shrink-0">
                    <img 
                        src={firstImage ? `/api/media/${firstImage}` : 'https://via.placeholder.com/150?text=No+Image'} 
                        alt={biz.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                    />
                </div>

                <div className="flex flex-col justify-center p-3 w-full overflow-hidden">
                    <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-bold text-slate-900 truncate">
                            {biz.name}
                            {biz.ceo_name && <span className="text-slate-400 font-medium text-[11px] ml-1.5 opacity-80">({biz.ceo_name} 대표님)</span>}
                        </h4>
                        <button 
                            onClick={(e) => toggleBookmark(e, biz.id)}
                            className="text-rose-500 hover:scale-110 transition-transform"
                        >
                            <span className="material-symbols-outlined fill-1 text-[20px]">favorite</span>
                        </button>
                    </div>
                    
                    <p className="text-[12px] text-primary font-semibold mb-1 truncate">
                        {biz.church_name}
                    </p>
                    
                    <div className="flex items-center gap-1 text-slate-400 mb-1.5 text-[11px] truncate w-full">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{biz.address}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-40 relative">
            <Header />
            
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-800">arrow_back</span>
                </button>
                <h1 className="ml-2 font-black text-slate-900 truncate">나의 관심 업체</h1>
            </div>

            <main className="max-w-md mx-auto px-5 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-medium">{error}</p>
                        {error.includes('로그인') && (
                            <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-primary text-white rounded-full text-sm font-bold">로그인하기</button>
                        )}
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-[64px] text-slate-100 mb-4 font-variation-fill">favorite</span>
                        <p className="text-slate-400 font-bold">아직 관심 활성화된 업체가 없습니다.</p>
                        <p className="text-[12px] text-slate-300 mt-1">마음에 드는 사업체에 하트를 눌러보세요!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {bookmarks.map(biz => (
                            <BusinessCard key={biz.id} biz={biz} />
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
};

export default Favorites;
