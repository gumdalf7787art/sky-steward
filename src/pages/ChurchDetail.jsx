import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ChurchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [data, setData] = useState({ church: null, businesses: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchChurchDetail = useCallback(async () => {
        try {
            const res = await fetch(`/api/churches/${id}`);
            const json = await res.json();
            if (json.success) {
                setData({
                    church: json.church,
                    businesses: json.businesses || []
                });
            } else {
                setError(json.error || '정보를 불러오지 못했습니다.');
            }
        } catch (err) {
            console.error("Failed to fetch church detail", err);
            setError('서버 통신 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchChurchDetail();
        window.scrollTo(0, 0);
    }, [fetchChurchDetail]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium tracking-tight">교회 정보를 불러오고 있습니다...</p>
        </div>
    );

    if (error || !data.church) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center">
            <span className="material-symbols-outlined text-rose-400 text-[64px] mb-4 opacity-50">error</span>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{error || '교회를 찾을 수 없습니다.'}</h3>
            <p className="text-slate-400 text-sm mb-8">주소가 잘못되었거나 삭제된 정보일 수 있습니다.</p>
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-800 text-white rounded-full font-bold shadow-lg active:scale-95 transition-all">뒤로가기</button>
        </div>
    );

    const { church, businesses } = data;
    const churchImages = church.images ? JSON.parse(church.images) : [];

    return (
        <div className="bg-slate-50 min-h-screen pb-40 relative">
            <Header />
            
            {/* Header Toolbar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center shadow-sm">
                <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-800">arrow_back</span>
                </button>
                <h1 className="ml-2 font-black text-slate-900 truncate">교회 상세 정보</h1>
            </div>

            <main className="max-w-md mx-auto">
                {/* 1. Church Visual Section */}
                <div className="bg-white border-b border-slate-100">
                    <div className="aspect-[16/9] bg-slate-200 relative overflow-hidden">
                        {churchImages.length > 0 ? (
                            <img src={`/api/media/${churchImages[0]}`} className="w-full h-full object-cover" alt={church.name} />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-[64px]">church</span>
                                <p className="text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">Church Profile</p>
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    
                    <div className="px-6 py-8 space-y-5 -mt-4 relative bg-white rounded-t-[2rem]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-primary text-white text-[10px] font-black rounded-full shadow-sm shadow-primary/20">{church.denomination || "교단 정보 없음"}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">{church.name}</h2>
                            <p className="text-sm text-slate-500 flex items-start gap-1 font-medium leading-relaxed">
                                <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">location_on</span>
                                <span>
                                    {church.address}
                                    {church.address_detail && <span className="block text-slate-400 text-[12px] font-bold mt-0.5">{church.address_detail}</span>}
                                </span>
                            </p>
                        </div>

                        {church.description && (
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {church.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-3 bg-slate-100 w-full"></div>

                {/* 2. Affiliated Businesses Section */}
                <section className="px-5 py-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900">소속 업체 목록</h3>
                        </div>
                        <span className="text-xs font-black text-slate-300 bg-slate-100 px-2 py-1 rounded-full">{businesses.length}</span>
                    </div>

                    <div className="grid gap-4">
                        {businesses.length > 0 ? (
                            businesses.map((biz) => (
                                <div 
                                    key={biz.id}
                                    onClick={() => navigate(`/business/${biz.id}`)}
                                    className="bg-white border border-slate-200 rounded-3xl p-4 flex gap-4 cursor-pointer hover:shadow-xl hover:border-transparent transition-all active:scale-[0.98] group"
                                >
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50">
                                        {biz.images ? (
                                            <img 
                                                src={`/api/media/${JSON.parse(biz.images)[0]}`} 
                                                className="w-full h-full object-cover" 
                                                alt={biz.name} 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <span className="material-symbols-outlined text-[32px]">image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{biz.category}</span>
                                        </div>
                                        <h4 className="font-black text-slate-800 truncate group-hover:text-primary transition-colors">{biz.name}</h4>
                                        <p className="text-[12px] text-slate-400 font-medium truncate mt-0.5">
                                            {biz.address} {biz.address_detail || ''}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center">
                                        <span className="material-symbols-outlined text-slate-200 group-hover:text-primary/40 transition-colors">chevron_right</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 border-dashed space-y-3">
                                <span className="material-symbols-outlined text-slate-100 text-[64px]">storefront</span>
                                <div className="space-y-1">
                                    <p className="text-slate-400 font-bold">등록된 성도 업체가 아직 없습니다.</p>
                                    <p className="text-[11px] text-slate-300 font-medium px-10 leading-relaxed">우리 교회의 성도 사업장이 있다면<br/>첫 번째로 등록해 보세요!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
};

export default ChurchDetail;
