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
        image: null
    });

    const [imagePreview, setImagePreview] = useState(null);
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
        }, 500);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.ceo_name || !formData.biz_no || !formData.category || !formData.phone) {
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
            } else if (key === 'image') {
                if (formData[key]) body.append(key, formData[key]);
            } else {
                body.append(key, formData[key]);
            }
        });

        try {
            const res = await fetch('/api/business/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
                body
            });

            const data = await res.json();

            if (res.ok) {
                alert('업체 등록이 완료되었습니다!');
                setAuth(prev => ({
                    ...prev,
                    user: { ...prev.user, role: 'BIZ' }
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
                    {/* Representative Image */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">대표 이미지</label>
                        <div 
                            onClick={() => document.getElementById('biz-image').click()}
                            className="relative w-full h-48 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden group shadow-sm bg-gradient-to-br from-white to-slate-50"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-bold">이미지를 업로드하세요</p>
                                    <p className="text-[11px] text-slate-300 mt-1">PNG, JPG (최대 5MB)</p>
                                </>
                            )}
                        </div>
                        <input type="file" id="biz-image" accept="image/*" onChange={handleImageChange} className="hidden" />
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
                            <label className="text-xs font-bold text-slate-500 ml-1">주소</label>
                            <input 
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
                                    상세페이지 노출
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
                            
                            {selectedChurch && (
                                <div className="mt-2 flex items-center justify-between px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-tighter">선택된 교회</span>
                                        <span className="text-sm font-bold text-indigo-700">{selectedChurch.name}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { setSelectedChurch(null); setFormData(prev => ({ ...prev, church_id: '' })); }}
                                        className="w-6 h-6 flex items-center justify-center text-indigo-300 hover:text-indigo-500"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
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
                                    <span className="text-xs text-slate-300 py-1.5 px-2">엔터나 콤마로 구분하여 입력하세요</span>
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

                        {/* Business Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업체 설명</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium resize-none leading-relaxed"
                                placeholder="업체에 대한 상세한 설명을 적어주세요. 사용자들에게 사업체의 신뢰를 줄 수 있는 내용을 담아보세요."
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
