import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const BusinessRegister = () => {
    const navigate = useNavigate();
    const auth = useRecoilValue(authState);
    const setAuth = useSetRecoilState(authState);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = auth.token || localStorage.getItem('sky_token');
            const localUser = localStorage.getItem('sky_user');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await fetch('/api/auth/verify', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setAuth({
                        isAuthenticated: true,
                        user: data.user,
                        token: token
                    });
                    setIsAuthReady(true);
                } else {
                    // Token is invalid or expired
                    console.error("Token verification failed");
                    localStorage.removeItem('sky_token');
                    localStorage.removeItem('sky_user');
                    setAuth({ isAuthenticated: false, user: null, token: null });
                    navigate('/login');
                }
            } catch (err) {
                console.error("Auth verification error", err);
                // Fallback to local state if server check fails (may be offline or server error)
                if (auth.isAuthenticated || (token && localUser)) {
                    setIsAuthReady(true);
                } else {
                    navigate('/login');
                }
            }
        };

        if (auth && auth.isAuthenticated !== undefined) {
            checkAuth();
        }
    }, [auth.isAuthenticated, navigate, setAuth]);

    const [formData, setFormData] = useState({
        name: '',
        ceo_name: '',
        biz_no: '',
        category: '',
        phone: '',
        show_phone: true,
        address: '',
        church_id: '',
        keywords: [],
        description: '',
        website: '',
        youtube: '',
        blog: '',
        instagram: ''
    });

    const [images, setImages] = useState([]); // Array of { file, preview, isMain }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // UI State
    const [keywordInput, setKeywordInput] = useState('');
    const [bizStatus, setBizStatus] = useState({ checked: false, loading: false, message: '', success: false });
    
    // Church Search State
    const [churchSearch, setChurchSearch] = useState('');
    const [churchResults, setChurchResults] = useState([]);
    const [selectedChurch, setSelectedChurch] = useState(null);
    const [isSearchingChurches, setIsSearchingChurches] = useState(false);
    const searchRef = useRef(null);

    // Image Optimization Logic
    const optimizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max_size = 1200;

                    if (width > height) {
                        if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                        }
                    } else {
                        if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        const optimizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(optimizedFile);
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const remainingSlots = 10 - images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert('이미지는 최대 10장까지 등록 가능합니다.');
        }

        const newImages = await Promise.all(filesToProcess.map(async (file) => {
            const optimized = await optimizeImage(file);
            return {
                file: optimized,
                preview: URL.createObjectURL(optimized),
                isMain: images.length === 0 && filesToProcess.indexOf(file) === 0 // First one is main by default if empty
            };
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const setMainImage = (index) => {
        setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));
    };

    const removeImage = (index) => {
        setImages(prev => {
            const filtered = prev.filter((_, i) => i !== index);
            if (prev[index].isMain && filtered.length > 0) {
                filtered[0].isMain = true; // Auto pick first as main if main removed
            }
            return filtered;
        });
    };

    const categories = [
        { id: 'restaurant', label: '식당/카페' },
        { id: 'mart', label: '마트/식자재' },
        { id: 'beauty', label: '헤어/뷰티' },
        { id: 'health', label: '스포츠/건강' },
        { id: 'education', label: '학원/교육' },
        { id: 'medical', label: '병원/약국' },
        { id: 'realestate', label: '부동산' },
        { id: 'law', label: '법률/세무' },
        { id: 'car', label: '자동차/정비' },
        { id: 'interior', label: '인테리어/수리' },
        { id: 'welfare', label: '요양/복지' },
        { id: 'shopping', label: '쇼핑' },
        { id: 'marketing', label: '인쇄/마케팅' },
        { id: 'online', label: '온라인쇼핑' },
        { id: 'etc', label: '기타 서비스' },
    ];

    // Handle church search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (churchSearch.length >= 2) {
                setIsSearchingChurches(true);
                try {
                    const res = await fetch(`/api/churches/search?q=${encodeURIComponent(churchSearch)}`);
                    const data = await res.json();
                    if (data.churches) setChurchResults(data.churches);
                } catch (err) {
                    console.error("Church search failed", err);
                } finally {
                    setIsSearchingChurches(false);
                }
            } else {
                setChurchResults([]);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [churchSearch]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setChurchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        
        // Reset biz check if biz_no changes
        if (name === 'biz_no') {
            setBizStatus({ checked: false, loading: false, message: '', success: false });
        }
    };

    const handleBizCheck = async () => {
        if (!formData.biz_no) {
            alert('사업자번호를 입력해주세요.');
            return;
        }
        setBizStatus(prev => ({ ...prev, loading: true, message: '' }));
        try {
            const res = await fetch(`/api/business/check-duplicate?biz_no=${formData.biz_no}`);
            const data = await res.json();
            if (data.success) {
                setBizStatus({ checked: true, loading: false, message: data.message, success: true });
            } else {
                setBizStatus({ checked: true, loading: false, message: data.error, success: false });
            }
        } catch (err) {
            setBizStatus({ checked: false, loading: false, message: '서버 오류가 발생했습니다.', success: false });
        }
    };

    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = keywordInput.trim();
            if (val && formData.keywords.length < 10 && !formData.keywords.includes(val)) {
                setFormData(prev => ({ ...prev, keywords: [...prev.keywords, val] }));
                setKeywordInput('');
            }
        }
    };

    const removeKeyword = (kw) => {
        setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.ceo_name || !formData.biz_no || !formData.category || !formData.phone || !formData.address) {
            setError('필수 항목(* 표시)을 모두 입력해주세요.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!bizStatus.success) {
            setError('사업자등록번호 중복 확인을 해주세요.');
            return;
        }

        setLoading(true);

        const body = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'keywords') {
                body.append(key, JSON.stringify(formData[key]));
            } else {
                body.append(key, formData[key]);
            }
        });

        // Append images in order, representative (main) first
        const sortedImages = [...images].sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0));
        sortedImages.forEach(img => {
            body.append('images', img.file);
        });

        const currentToken = auth.token || localStorage.getItem('sky_token');

        try {
            const res = await fetch('/api/business/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                },
                body
            });

            const data = await res.json();

            if (res.ok) {
                alert('업체 등록이 완료되었습니다!');
                setAuth(prev => ({
                    ...prev,
                    user: prev.user ? { ...prev.user, role: 'BIZ' } : null
                }));
                navigate('/mypage/business-manage');
            } else {
                setError(data.error || '등록 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setError('서버와의 통신에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthReady) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium">인증 정보를 확인 중입니다...</p>
        </div>
    );

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto pt-6 pb-32 px-5 bg-[#F8FAFC] min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">사업체 등록</h2>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm font-medium mb-6 flex items-center gap-2 border border-rose-100 italic transition-all animate-pulse">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Multi Image Upload */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 flex justify-between">
                            <span>사업체 이미지 (최대 10장)</span>
                            <span className={images.length >= 10 ? 'text-rose-500' : ''}>{images.length}/10</span>
                        </label>
                        
                        <div className="grid grid-cols-5 gap-2">
                            {images.map((img, idx) => (
                                <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${img.isMain ? 'border-primary' : 'border-slate-100'}`}>
                                    <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                    {!img.isMain && (
                                        <button 
                                            type="button" 
                                            onClick={() => setMainImage(idx)}
                                            className="absolute bottom-0 left-0 right-0 py-0.5 bg-black/30 text-[9px] text-white font-bold backdrop-blur-sm"
                                        >
                                            대표설정
                                        </button>
                                    )}
                                    {img.isMain && (
                                        <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-primary text-[9px] text-white font-black rounded-br-lg">
                                            대표
                                        </div>
                                    )}
                                </div>
                            ))}
                            {images.length < 10 && (
                                <button 
                                    type="button"
                                    onClick={() => document.getElementById('biz-images').click()}
                                    className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-all text-slate-300"
                                >
                                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                                    <span className="text-[10px] font-bold mt-1">추가</span>
                                </button>
                            )}
                        </div>
                        <input type="file" id="biz-images" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                        <p className="text-[10px] text-slate-400 ml-1 mt-1">* 첫 번째로 선택하거나 '대표설정'을 누른 이미지가 메인에 노출됩니다.</p>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                        {/* Business Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">상호명 <span className="text-rose-500 font-black">*</span></label>
                            <input 
                                required
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                placeholder="사업장 이름을 입력하세요"
                            />
                        </div>

                        {/* CEO Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">대표자명 <span className="text-rose-500 font-black">*</span></label>
                            <input 
                                required
                                name="ceo_name"
                                type="text"
                                value={formData.ceo_name}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                placeholder="대표자 성함을 입력하세요"
                            />
                        </div>

                        {/* Business Address */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">주소 <span className="text-rose-500 font-black">*</span></label>
                            <input 
                                required
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                placeholder="사업체 주소를 입력하세요"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between items-center">
                                <span>연락처 <span className="text-rose-500 font-black">*</span></span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-400 select-none">
                                    <input 
                                        type="checkbox" 
                                        name="show_phone" 
                                        checked={formData.show_phone} 
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary/20"
                                    />
                                    상세페이지 노출 안 함
                                </label>
                            </label>
                            <input 
                                required
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                placeholder="예: 010-1234-5678"
                            />
                        </div>

                        {/* Biz No + Duplicate Check */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업자등록번호 <span className="text-rose-500 font-black">*</span></label>
                            <div className="flex gap-2">
                                <input 
                                    required
                                    name="biz_no"
                                    type="text"
                                    value={formData.biz_no}
                                    onChange={handleChange}
                                    className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                    placeholder="000-00-00000"
                                />
                                <button 
                                    type="button"
                                    onClick={handleBizCheck}
                                    disabled={bizStatus.loading || bizStatus.success}
                                    className={`px-5 rounded-2xl font-bold text-xs shadow-sm transition-all ${bizStatus.success ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-800 text-white active:scale-95'}`}
                                >
                                    {bizStatus.loading ? '...' : bizStatus.success ? '확인됨' : '중복확인'}
                                </button>
                            </div>
                            {bizStatus.message && (
                                <p className={`text-[11px] font-bold mt-1.5 ml-1 ${bizStatus.success ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {bizStatus.message}
                                </p>
                            )}
                        </div>

                        {/* Church Search */}
                        <div className="space-y-1.5 relative" ref={searchRef}>
                            <label className="text-xs font-bold text-slate-500 ml-1">교회 선택</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={selectedChurch ? selectedChurch.name : churchSearch}
                                    onChange={(e) => {
                                        if (selectedChurch) setSelectedChurch(null);
                                        setChurchSearch(e.target.value);
                                    }}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium pr-12"
                                    placeholder="교회 이름을 입력하여 검색하세요"
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                    {isSearchingChurches ? 'sync' : 'search'}
                                </span>
                            </div>
                            
                            {churchResults.length > 0 && !selectedChurch && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-hidden divide-y divide-slate-50">
                                    {churchResults.map(church => (
                                        <button 
                                            key={church.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedChurch(church);
                                                setFormData(prev => ({ ...prev, church_id: church.id }));
                                                setChurchResults([]);
                                            }}
                                            className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                                        >
                                            <span className="font-bold text-slate-800 text-sm">{church.name}</span>
                                            <span className="text-[11px] text-slate-400 leading-tight">{church.address}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Select */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">업종 선택 <span className="text-rose-500 font-black">*</span></label>
                            <div className="relative">
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium appearance-none"
                                >
                                    <option value="">카테고리를 선택하세요</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        </div>

                        {/* Keyword System */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between">
                                <span>키워드 입력</span>
                                <span className="text-[10px] text-slate-400">{formData.keywords.length}/10</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2 min-h-[44px] p-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                                {formData.keywords.map(kw => (
                                    <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-white text-primary text-[12px] font-bold rounded-full border border-primary/20 hover:border-primary/50 transition-all shadow-sm">
                                        #{kw}
                                        <button type="button" onClick={() => removeKeyword(kw)} className="flex items-center text-slate-300 hover:text-rose-500">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </span>
                                ))}
                                {formData.keywords.length === 0 && (
                                    <span className="text-xs text-slate-300 py-1.5 px-2">아래칸에서 키워드를 입력해주세요.</span>
                                )}
                            </div>
                            <input 
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={handleKeywordKeyDown}
                                disabled={formData.keywords.length >= 10}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                placeholder={formData.keywords.length >= 10 ? "최대 10개까지 가능합니다" : "키워드 입력 후 엔터를 치세요"}
                            />
                        </div>

                        {/* Social Links Section */}
                        <div className="pt-4 space-y-4 border-t border-slate-50">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">나머지 링크 입력 (필수 아님)</h3>
                            
                            <div className="space-y-3">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">language</span>
                                    <input 
                                        name="website"
                                        type="url"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-all text-slate-700 text-sm"
                                        placeholder="홈페이지 주소"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">video_library</span>
                                    <input 
                                        name="youtube"
                                        type="url"
                                        value={formData.youtube}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-all text-slate-700 text-sm"
                                        placeholder="유튜브 채널 주소"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">rss_feed</span>
                                    <input 
                                        name="blog"
                                        type="url"
                                        value={formData.blog}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-all text-slate-700 text-sm"
                                        placeholder="블로그 주소"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">photo_camera</span>
                                    <input 
                                        name="instagram"
                                        type="text"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-all text-slate-700 text-sm"
                                        placeholder="인스타그램 ID 또는 주소"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Description */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between">
                                <span>사업체 설명</span>
                                <span className={formData.description.length > 1000 ? 'text-rose-500' : 'text-slate-400'}>{formData.description.length}/1000</span>
                            </label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                maxLength="1000"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium resize-none leading-relaxed"
                                placeholder="업체에 대한 상세한 설명을 적어주세요. 최대 1000자까지 가능합니다."
                            ></textarea>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 pb-12">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="flex-1 py-5 bg-white text-slate-400 rounded-2xl font-bold hover:bg-slate-50 border border-slate-100 shadow-sm transition-all"
                        >
                            취소
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-[2] py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : '사업체 등록하기'}
                        </button>
                    </div>
                </form>
            </main>
            <BottomNav />
        </>
    );
};

export default BusinessRegister;
