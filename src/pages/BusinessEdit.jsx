import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const BusinessEdit = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [auth, setAuth] = useRecoilState(authState);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [churchSearch, setChurchSearch] = useState('');
    const [churchResults, setChurchResults] = useState([]);
    const [isSearchingChurches, setIsSearchingChurches] = useState(false);
    const searchRef = useRef(null);

    const [images, setImages] = useState([]); // Array of { id, preview, file, isMain, isExisting, key }
    const [formData, setFormData] = useState({
        name: '',
        ceo_name: '',
        biz_no: '',
        original_biz_no: '',
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

    const [bizStatus, setBizStatus] = useState({ checked: true, loading: false, message: '', success: true });
    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const token = auth.token || localStorage.getItem('sky_token');
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
                    setAuth({ isAuthenticated: true, user: data.user, token: token });
                    setIsAuthReady(true);
                    fetchBusinessData(token);
                } else {
                    localStorage.removeItem('sky_token');
                    localStorage.removeItem('sky_user');
                    setAuth({ isAuthenticated: false, user: null, token: null });
                    navigate('/login');
                }
            } catch (err) {
                if (auth.isAuthenticated || token) {
                    setIsAuthReady(true);
                    fetchBusinessData(token);
                } else {
                    navigate('/login');
                }
            }
        };

        const fetchBusinessData = async (token) => {
            try {
                const res = await fetch(`/api/business/get?id=${businessId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const biz = data.business;
                    setFormData({
                        name: biz.name || '',
                        ceo_name: biz.ceo_name || '',
                        biz_no: biz.biz_no || '',
                        original_biz_no: biz.biz_no || '',
                        category: biz.category || '',
                        phone: biz.phone || '',
                        show_phone: biz.show_phone === 1,
                        address: biz.address || '',
                        church_id: biz.church_id || '',
                        keywords: biz.keywords ? JSON.parse(biz.keywords) : [],
                        description: biz.description || '',
                        website: biz.website || '',
                        youtube: biz.youtube || '',
                        blog: biz.blog || '',
                        instagram: biz.instagram || ''
                    });

                    // Handle existing images
                    if (biz.images) {
                        const keys = JSON.parse(biz.images);
                        const existingImages = keys.map((key, idx) => ({
                            id: `existing-${idx}`,
                            preview: `/api/media/${key}`,
                            file: null,
                            isMain: idx === 0,
                            isExisting: true,
                            key: key
                        }));
                        setImages(existingImages);
                    }
                } else {
                    setError(data.error || '업체 정보를 불러오지 못했습니다.');
                }
            } catch (err) {
                setError('서버 통신 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (auth && auth.isAuthenticated !== undefined) {
            checkAuth();
        }
    }, [businessId, navigate, setAuth]);

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
        }, 500);
        return () => clearTimeout(timer);
    }, [churchSearch]);

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
        if (name === 'biz_no') {
            const isOriginal = value === formData.original_biz_no;
            setBizStatus({ checked: isOriginal, loading: false, message: '', success: isOriginal });
        }
    };

    const handleBizCheck = async () => {
        if (!formData.biz_no) { return; }
        if (formData.biz_no === formData.original_biz_no) {
            setBizStatus({ checked: true, loading: false, message: '사용 중인 번호입니다.', success: true });
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
            setBizStatus({ checked: false, loading: false, message: '서버 오류', success: false });
        }
    };

    const optimizeImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max = 1200;
                    if (width > height) {
                        if (width > max) { height *= max / width; width = max; }
                    } else {
                        if (height > max) { width *= max / height; height = max; }
                    }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 10) { alert('최대 10장까지 가능합니다.'); return; }
        setSaving(true);
        const newImages = await Promise.all(files.map(async (file) => {
            const optimized = await optimizeImage(file);
            return {
                id: Math.random().toString(36).substr(2, 9),
                preview: URL.createObjectURL(optimized),
                file: optimized,
                isMain: false,
                isExisting: false
            };
        }));
        if (images.length === 0 && newImages.length > 0) newImages[0].isMain = true;
        setImages(prev => [...prev, ...newImages]);
        setSaving(false);
    };

    const removeImage = (id) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            if (filtered.length > 0 && !filtered.some(img => img.isMain)) filtered[0].isMain = true;
            return filtered;
        });
    };

    const setMainImage = (id) => {
        setImages(prev => prev.map(img => ({ ...img, isMain: img.id === id })));
    };

    const Categories = [
        { id: 'health', label: '병원/건강' }, { id: 'food', label: '음식점/카페' },
        { id: 'edu', label: '교육/학원' }, { id: 'life', label: '생활/편의' },
        { id: 'beauty', label: '뷰티/패션' }, { id: 'etc', label: '기타 서비스' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.ceo_name || !formData.biz_no || !formData.category || !formData.phone || !formData.address) {
            setError('필수 항목을 모두 입력해주세요.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
        }
        if (!bizStatus.success) { setError('사업자번호 중복 확인을 해주세요.'); return; }
        setSaving(true);

        const body = new FormData();
        body.append('id', businessId);
        Object.keys(formData).forEach(key => {
            if (key === 'keywords') body.append(key, JSON.stringify(formData[key]));
            else if (key !== 'original_biz_no') body.append(key, formData[key]);
        });

        const sortedImages = [...images].sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0));
        const existingKeys = sortedImages.filter(img => img.isExisting).map(img => img.key);
        body.append('existing_images', JSON.stringify(existingKeys));

        sortedImages.filter(img => !img.isExisting).forEach(img => {
            body.append('new_images', img.file);
        });

        const currentToken = auth.token || localStorage.getItem('sky_token');
        try {
            const res = await fetch('/api/business/update', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` },
                body
            });
            if (res.ok) {
                alert('수정이 완료되었습니다!'); navigate('/mypage/business-manage');
            } else {
                const d = await res.json(); setError(d.error || '수정 중 오류가 발생했습니다.');
            }
        } catch (err) { setError('서버 통신 실패'); }
        finally { setSaving(false); }
    };

    if (!isAuthReady || loading) return <div className="p-10 text-center">불러오는 중...</div>;

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto pt-6 pb-24 px-5">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">사업체 정보 수정</h2>
                </div>

                {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm mb-6 flex items-center gap-2 border border-rose-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                사업체 이미지 <span className="text-xs text-slate-400 font-medium">(최대 10장)</span>
                            </h3>
                            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">{images.length}/10</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {images.map((img) => (
                                <div key={img.id} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${img.isMain ? 'border-primary shadow-lg shadow-primary/20' : 'border-slate-100'}`}>
                                    <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md">
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                    <button type="button" onClick={() => setMainImage(img.id)} className={`absolute bottom-0 left-0 right-0 py-1.5 text-[10px] font-bold text-center ${img.isMain ? 'bg-primary text-white' : 'bg-black/40 text-white/80'}`}>
                                        {img.isMain ? '대표이미지' : '대표설정'}
                                    </button>
                                </div>
                            ))}
                            {images.length < 10 && (
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all">
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    <span className="material-symbols-outlined text-slate-400 text-[28px]">add_a_photo</span>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">추가</span>
                                </label>
                            )}
                        </div>
                    </section>

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
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

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between items-center">
                                <span>연락처 <span className="text-rose-500 font-black">*</span></span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-400 select-none">
                                    <input 
                                        type="checkbox" 
                                        name="show_phone" 
                                        checked={!formData.show_phone} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, show_phone: !e.target.checked }))}
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
                                    disabled={bizStatus.loading || (bizStatus.success && formData.biz_no === formData.original_biz_no)}
                                    className={`px-5 rounded-2xl font-bold text-xs shadow-sm transition-all ${bizStatus.success ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-800 text-white active:scale-95'}`}
                                >
                                    {bizStatus.loading ? '...' : (bizStatus.success && formData.biz_no === formData.original_biz_no) ? '기존번호' : bizStatus.success ? '확인됨' : '중복확인'}
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
                                    value={churchSearch || (formData.church_id ? "연결된 교회가 있습니다" : "")}
                                    onChange={(e) => {
                                        setChurchSearch(e.target.value);
                                        if (formData.church_id) setFormData(prev => ({ ...prev, church_id: '' }));
                                    }}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium pr-12"
                                    placeholder="교회 이름을 검색하여 변경할 수 있습니다"
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                    {isSearchingChurches ? 'sync' : 'search'}
                                </span>
                            </div>
                            
                            {churchResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-hidden divide-y divide-slate-50">
                                    {churchResults.map(church => (
                                        <button 
                                            key={church.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, church_id: church.id }));
                                                setChurchSearch(church.name);
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
                                    {[
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
                                    ].map(cat => (
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
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))} className="flex items-center text-slate-300 hover:text-rose-500">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        const val = keywordInput.trim();
                                        if (val && formData.keywords.length < 10 && !formData.keywords.includes(val)) {
                                            setFormData(prev => ({ ...prev, keywords: [...prev.keywords, val] }));
                                            setKeywordInput('');
                                        }
                                    }
                                }}
                                disabled={formData.keywords.length >= 10}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium"
                                placeholder={formData.keywords.length >= 10 ? "최대 10개까지 가능합니다" : "키워드 입력 후 엔터를 치세요"}
                            />
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm mb-2 px-1 flex items-center gap-2">
                             <span className="material-symbols-outlined text-primary text-[18px]">vlink</span> 
                             소셜 미디어 / 정보 링크
                        </h4>
                        <div className="grid gap-3">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">language</span>
                                <input name="website" value={formData.website} onChange={handleChange} placeholder="홈페이지 주소" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-xl text-sm" />
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">video_library</span>
                                <input name="youtube" value={formData.youtube} onChange={handleChange} placeholder="유튜브 채널 주소" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-xl text-sm" />
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">rss_feed</span>
                                <input name="blog" value={formData.blog} onChange={handleChange} placeholder="블로그 주소" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-xl text-sm" />
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">photo_camera</span>
                                <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="인스타그램 ID 또는 주소" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-xl text-sm" />
                            </div>
                        </div>
                    </section>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <label className="block text-sm font-bold text-slate-700 mb-3 px-1">사업체 설명</label>
                        <div className="relative">
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                maxLength={1000} 
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl min-h-[160px] resize-none leading-relaxed" 
                                placeholder="고객들에게 업체를 소개해주세요." 
                            />
                            <div className="absolute bottom-4 right-5 text-[10px] font-bold text-slate-300">{formData.description.length}/1000</div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving || !bizStatus.success} className="w-full py-5 bg-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50">
                        {saving ? '저장 중...' : '수정 완료하기'}
                    </button>
                </form>
            </main>
            <BottomNav />
        </>
    );
};

export default BusinessEdit;
