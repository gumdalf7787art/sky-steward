import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Favorites = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookmarks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/bookmarks/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) {
                    setBookmarks(json.bookmarks);
                } else {
                    setError(json.error);
                }
            } catch (err) {
                setError('관심 목록을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, []);

    const handleToggleBookmark = async (e, bizId) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/bookmarks/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ business_id: bizId })
            });
            const json = await res.json();
            if (json.success && !json.isBookmarked) {
                // Remove from list
                setBookmarks(prev => prev.filter(b => b.id !== bizId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <div className="bg-slate-50 min-h-screen pb-40">
            <Header />
            
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-800">arrow_back</span>
                </button>
                <h1 className="ml-2 font-black text-slate-900">관심 리스트</h1>
            </div>

            <main className="max-w-md mx-auto px-4 py-6">
                {!isLoggedIn ? (
                    <div className="py-20 text-center space-y-4">
                        <span className="material-symbols-outlined text-slate-200 text-[64px]">favorite</span>
                        <div className="space-y-1">
                            <p className="text-slate-500 font-bold">로그인이 필요한 서비스입니다.</p>
                            <p className="text-sm text-slate-400">관심 있는 사업체를 등록하고 관리해보세요!</p>
                        </div>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            로그인하기
                        </button>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                        <span className="material-symbols-outlined text-slate-200 text-[64px]">heart_broken</span>
                        <div className="space-y-1">
                            <p className="text-slate-500 font-bold">아직 관심 등록한 업체가 없습니다.</p>
                            <p className="text-sm text-slate-400">마음에 드는 사업체를 발견하면<br/>하트 아이콘을 눌러주세요!</p>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="text-primary font-bold text-sm underline underline-offset-4"
                        >
                            사업체 둘러보기
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {bookmarks.map(biz => {
                            const images = biz.images ? JSON.parse(biz.images) : [];
                            return (
                                <div 
                                    key={biz.id} 
                                    onClick={() => navigate(`/business/${biz.id}`)}
                                    className="flex bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all h-[110px]"
                                >
                                    <div className="w-[110px] min-w-[110px] h-full relative bg-slate-100">
                                        <img 
                                            src={images.length > 0 ? `/api/media/${images[0]}` : 'https://via.placeholder.com/150'} 
                                            alt={biz.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col justify-center p-3 w-full overflow-hidden">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-slate-900 truncate">
                                                {biz.name}
                                                {biz.ceo_name && <span className="text-slate-400 font-medium text-[10px] ml-1">({biz.ceo_name} 대표님)</span>}
                                            </h4>
                                            <button 
                                                onClick={(e) => handleToggleBookmark(e, biz.id)} 
                                                className="text-rose-500 hover:scale-110 transition-transform"
                                            >
                                                <span className="material-symbols-outlined fill-1 text-[20px]">favorite</span>
                                            </button>
                                        </div>
                                        
                                        <p className="text-[11px] text-primary font-bold mb-1 truncate">
                                            {biz.church_name}
                                        </p>
                                        
                                        <div className="flex items-center gap-1 text-slate-400 mb-1.5 text-[11px] truncate">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            <span className="truncate">{biz.address}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
};

export default Favorites;
