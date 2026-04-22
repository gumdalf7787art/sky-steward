import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    
    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Limits for 'More' functionality
    const [limits, setLimits] = useState({
        byName: 3,
        byChurch: 3,
        byKeyword: 3,
        byChurchList: 3
    });

    const fetchResults = useCallback(async (q) => {
        if (!q.trim()) {
            setResults(null);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const json = await res.json();
            if (json.success) {
                setResults(json.results);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (query) {
            fetchResults(query);
        }
    }, [query, fetchResults]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: inputValue });
        setLimits({ byName: 3, byChurch: 3, byKeyword: 3, byChurchList: 3 }); // Reset limits on new search
    };

    const showMore = (category) => {
        setLimits(prev => ({
            ...prev,
            [category]: prev[category] + 10
        }));
    };

    const BusinessCard = ({ biz }) => (
        <div 
            onClick={() => navigate(`/business/${biz.id}`)}
            className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
        >
            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                {biz.images ? (
                    <img src={`/api/media/${JSON.parse(biz.images)[0]}`} className="w-full h-full object-cover" alt={biz.name} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-[32px]">image</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md w-fit mb-1">{biz.category}</span>
                <h4 className="font-black text-slate-800 truncate">{biz.name}</h4>
                <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">church</span>
                    {biz.church_name}
                </p>
            </div>
        </div>
    );

    const ChurchCard = ({ church }) => (
        <div 
            onClick={() => navigate(`/churches/detail?id=${church.id}`)}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
        >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]">church</span>
            </div>
            <div className="flex flex-col justify-center overflow-hidden">
                <h4 className="font-black text-slate-800 truncate">{church.name}</h4>
                <p className="text-[12px] text-slate-400 font-medium truncate">{church.address || "주소 정보 없음"}</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
        </div>
    );

    const ResultSection = ({ title, data, limit, categoryKey, icon, type = 'business' }) => {
        if (!data || data.length === 0) return null;
        
        const displayed = data.slice(0, limit);
        const hasMore = data.length > limit;

        return (
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <span className={`material-symbols-outlined text-[20px] ${categoryKey === 'byName' ? 'text-blue-500' : (categoryKey === 'byChurch' || categoryKey === 'byChurchList') ? 'text-primary' : 'text-amber-500'}`}>{icon}</span>
                    <h3 className="text-sm font-black text-slate-800">{title} <span className="text-slate-300 ml-1">{data.length}</span></h3>
                </div>
                <div className="grid gap-3">
                    {displayed.map(item => (
                        type === 'business' 
                            ? <BusinessCard key={item.id} biz={item} /> 
                            : <ChurchCard key={item.id} church={item} />
                    ))}
                </div>
                {hasMore && (
                    <button 
                        onClick={() => showMore(categoryKey)}
                        className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[12px] font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                        결과 더보기
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                )}
            </section>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            <Header />
            
            <main className="max-w-md mx-auto px-5 pt-6 space-y-8">
                {/* Search Input Area */}
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="업체명, 교회명, 키워드를 입력해 주세요"
                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[15px] font-medium"
                    />
                </form>

                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-400 font-bold tracking-tight">청지기 사업장을 찾고 있습니다...</p>
                    </div>
                ) : results ? (
                    results.total > 0 ? (
                        <div className="space-y-10">
                            <ResultSection 
                                title="검색된 교회" 
                                data={results.byChurchList} 
                                limit={limits.byChurchList} 
                                categoryKey="byChurchList" 
                                icon="account_balance"
                                type="church"
                            />
                            <ResultSection 
                                title="업체명 검색 결과" 
                                data={results.byName} 
                                limit={limits.byName} 
                                categoryKey="byName" 
                                icon="storefront"
                            />
                            <ResultSection 
                                title="우리 교회 업체 결과" 
                                data={results.byChurch} 
                                limit={limits.byChurch} 
                                categoryKey="byChurch" 
                                icon="church"
                            />
                            <ResultSection 
                                title="키워드/설명 검색 결과" 
                                data={results.byKeyword} 
                                limit={limits.byKeyword} 
                                categoryKey="byKeyword" 
                                icon="sell"
                            />
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <span className="material-symbols-outlined text-slate-200 text-[64px]">search_off</span>
                            <div className="space-y-1">
                                <p className="text-slate-600 font-black">검색 결과가 없습니다</p>
                                <p className="text-[12px] text-slate-400 font-medium">다른 검색어를 입력하거나<br/>정확한 명칭인지 확인해 주세요.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="py-20 text-center space-y-4 opacity-40">
                        <span className="material-symbols-outlined text-slate-300 text-[80px]">travel_explore</span>
                        <p className="text-sm text-slate-400 font-black italic tracking-widest uppercase">Search for Stewards</p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
};

export default Search;
