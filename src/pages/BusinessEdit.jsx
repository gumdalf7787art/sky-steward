import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

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
    const [menuBoardImage, setMenuBoardImage] = useState(null); // { preview, file, isExisting, key }
    const [menus, setMenus] = useState([]); // Array of { name, price, description, preview, file, isExisting, existingKey, hasImage }
    
    const [formData, setFormData] = useState({
        name: '',
        ceo_name: '',
        biz_no: '',
        original_biz_no: '',
        category: '',
        phone: '',
        show_phone: true,
        address: '',
        address_detail: '',
        church_id: '',
        keywords: [],
        description: '',
        website: '',
        youtube: '',
        blog: '',
        instagram: '',
        operating_hours: '',
        parking_info: ''
    });

    const [bizStatus, setBizStatus] = useState({ checked: true, loading: false, message: '', success: true });
    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('sky_token');
            if (!token && !auth.isAuthenticated) { navigate('/login'); return; }
            setIsAuthReady(true);
        };
        checkAuth();
    }, [auth.isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthReady) return;

        const fetchBusinessData = async () => {
            try {
                const token = auth.token || localStorage.getItem('sky_token');
                const res = await fetch(`/api/business/get?id=${businessId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.success) {
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
                        address_detail: biz.address_detail || '',
                        church_id: biz.church_id || '',
                        keywords: JSON.parse(biz.keywords || '[]'),
                        description: biz.description || '',
                        website: biz.website || '',
                        youtube: biz.youtube || '',
                        blog: biz.blog || '',
                        instagram: biz.instagram || '',
                        operating_hours: biz.operating_hours || '',
                        parking_info: biz.parking_info || ''
                    });

                    if (biz.church_name) setChurchSearch(biz.church_name);

                    // Handle existing business images
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

                    // Handle menu board image
                    if (biz.menu_board_image) {
                        setMenuBoardImage({
                            preview: `/api/media/${biz.menu_board_image}`,
                            file: null,
                            isExisting: true,
                            key: biz.menu_board_image
                        });
                    }

                    // Handle individual menus
                    if (data.menus) {
                        const existingMenus = data.menus.map((m) => ({
                            name: m.name || '',
                            price: m.price || '',
                            description: m.description || '',
                            preview: m.image_key ? `/api/media/${m.image_key}` : null,
                            file: null,
                            isExisting: true,
                            existingKey: m.image_key,
                            hasImage: !!m.image_key
                        }));
                        setMenus(existingMenus);
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

        fetchBusinessData();
    }, [businessId, isAuthReady, auth.token]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (churchSearch.length >= 2) {
                setIsSearchingChurches(true);
                try {
                    const res = await fetch(`/api/churches/search?q=${encodeURIComponent(churchSearch)}`);
                    const data = await res.json();
                    if (data.churches) setChurchResults(data.churches);
                } catch (err) { }
                finally { setIsSearchingChurches(false); }
            } else {
                setChurchResults([]);
            }
        }, 300);
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
        if (!formData.biz_no) return;
        if (formData.biz_no === formData.original_biz_no) {
            setBizStatus({ checked: true, loading: false, message: '기존에 등록된 번호입니다.', success: true });
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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            alert('이미지는 최대 5장까지 가능합니다.'); return;
        }
        for (const file of files) {
            const optimized = await optimizeImage(file);
            setImages(prev => [
                ...prev, 
                { id: Date.now() + Math.random(), preview: URL.createObjectURL(optimized), file: optimized, isMain: prev.length === 0, isExisting: false }
            ]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => {
            const filtered = prev.filter((_, i) => i !== index);
            if (prev[index].isMain && filtered.length > 0) filtered[0].isMain = true;
            return filtered;
        });
    };

    const setMainImage = (index) => {
        setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));
    };

    const handleMenuBoardUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const optimized = await optimizeImage(file);
            setMenuBoardImage({ preview: URL.createObjectURL(optimized), file: optimized, isExisting: false });
        }
    };

    const addMenu = () => {
        if (menus.length >= 10) { alert('메뉴는 최대 10개까지 등록 가능합니다.'); return; }
        setMenus([...menus, { name: '', price: '', description: '', preview: null, file: null, isExisting: false, hasImage: false }]);
    };

    const updateMenu = (index, field, value) => {
        const newMenus = [...menus];
        newMenus[index][field] = value;
        setMenus(newMenus);
    };

    const handleMenuImageUpload = async (index, file) => {
        if (!file) return;
        const optimized = await optimizeImage(file);
        const newMenus = [...menus];
        newMenus[index].file = optimized;
        newMenus[index].preview = URL.createObjectURL(optimized);
        newMenus[index].hasImage = true;
        setMenus(newMenus);
    };

    const removeMenu = (index) => {
        setMenus(menus.filter((_, i) => i !== index));
    };

    const handleAddKeyword = (e) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            e.preventDefault();
            if (formData.keywords.length >= 10) { alert('키워드는 최대 10개까지 가능합니다.'); return; }
            if (!formData.keywords.includes(keywordInput.trim())) {
                setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
            }
            setKeywordInput('');
        }
    };

    const removeKeyword = (tag) => {
        setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== tag) }));
    };

    const openPostcode = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                let fullAddress = data.address;
                let extraAddress = '';
                if (data.addressType === 'R') {
                    if (data.bname !== '') extraAddress += data.bname;
                    if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                    fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                }
                setFormData(prev => ({ ...prev, address: fullAddress }));
                setTimeout(() => document.getElementById('address_detail')?.focus(), 100);
            }
        }).open();
    };

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
        sortedImages.filter(img => !img.isExisting).forEach(img => body.append('new_images', img.file));

        if (menuBoardImage) {
            if (menuBoardImage.isExisting) body.append('existing_menu_board', menuBoardImage.key);
            else body.append('new_menu_board', menuBoardImage.file);
        } else {
            body.append('remove_menu_board', 'true');
        }

        const menuDataForJson = menus.map(m => ({
            name: m.name, price: m.price, description: m.description, 
            hasImage: m.hasImage, isExisting: m.isExisting, existingKey: m.existingKey
        }));
        body.append('menus', JSON.stringify(menuDataForJson));
        menus.forEach(m => {
            if (!m.isExisting && m.file) body.append('menu_images', m.file);
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

    if (!isAuthReady || loading) return <div className="p-10 text-center font-medium text-slate-400">데이터를 불러오는 중입니다...</div>;

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto pt-6 pb-24 px-5 bg-white min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-on-surface">사업체 정보 수정</h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-500 rounded-2xl text-sm font-medium border border-rose-100 animate-fadeIn">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest ml-1">기본 정보</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업체 이름 *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="사업체명을 입력하세요" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">대표자명 *</label>
                                <input type="text" name="ceo_name" value={formData.ceo_name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="대표자 성함" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">업종 선택 *</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium appearance-none">
                                    <option value="">선택하세요</option>
                                    {categories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업자 등록번호 *</label>
                            <div className="flex gap-2">
                                <input type="text" name="biz_no" value={formData.biz_no} onChange={handleChange} className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="000-00-00000" />
                                <button type="button" onClick={handleBizCheck} disabled={bizStatus.loading || (formData.biz_no === formData.original_biz_no)} className="px-6 bg-slate-800 text-white rounded-2xl font-bold text-sm disabled:bg-slate-200">
                                    {bizStatus.loading ? '확인 중' : '중복 확인'}
                                </button>
                            </div>
                            {bizStatus.message && <p className={`text-[11px] ml-1 font-bold ${bizStatus.success ? 'text-emerald-500' : 'text-rose-500'}`}>{bizStatus.message}</p>}
                        </div>

                        <div className="space-y-1.5 relative" ref={searchRef}>
                            <label className="text-xs font-bold text-slate-500 ml-1">교회 선택</label>
                            <div className="relative">
                                <input type="text" value={churchSearch} onChange={(e) => { if (formData.church_id) setFormData(prev => ({ ...prev, church_id: '' })); setChurchSearch(e.target.value); }} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium pr-12" placeholder="교회 이름을 검색하여 변경하세요" />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{isSearchingChurches ? 'sync' : 'search'}</span>
                            </div>
                            {churchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fadeIn">
                                    {churchResults.map(c => (
                                        <div key={c.id} onClick={() => { setFormData(prev => ({ ...prev, church_id: c.id })); setChurchSearch(c.name); setChurchResults([]); }} className="px-5 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none">
                                            <p className="font-bold text-slate-800">{c.name}</p>
                                            <p className="text-[11px] text-slate-400">{c.address}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address Branding Section */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest ml-1">연락처 및 위치</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">연락처 *</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="010-0000-0000" />
                            <label className="flex items-center gap-2 mt-2 ml-1 cursor-pointer">
                                <input type="checkbox" name="show_phone" checked={formData.show_phone} onChange={handleChange} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-xs font-bold text-slate-500">상세 페이지에 전화번호 노출</span>
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업체 주소 *</label>
                            <div className="flex gap-2 mb-2">
                                <input type="text" value={formData.address} readOnly className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-medium" placeholder="주소 검색을 이용하세요" />
                                <button type="button" onClick={openPostcode} className="px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm">주소 검색</button>
                            </div>
                            <input type="text" id="address_detail" name="address_detail" value={formData.address_detail} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="나머지 주소를 입력하세요" />
                        </div>
                    </div>

                    {/* Operational Details Section */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest ml-1">운영 상세 정보</h3>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">영업 시간</label>
                            <input type="text" name="operating_hours" value={formData.operating_hours} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="예: 평일 09:00 - 20:00 (일요일 휴무)" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">주차 정보</label>
                            <input type="text" name="parking_info" value={formData.parking_info} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="예: 건물 내 무료 주차 가능" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업체 소개</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium resize-none" placeholder="성도님들께 사업체를 소개해 주세요" />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest ml-1">사업체 이미지 (최대 5장)</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <label className="w-24 h-24 flex-shrink-0 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-300">add_a_photo</span>
                                <span className="text-[10px] font-bold text-slate-400 mt-1">{images.length}/5</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                            {images.map((img, idx) => (
                                <div key={img.id} className="w-24 h-24 flex-shrink-0 relative rounded-2xl overflow-hidden border border-slate-100 group">
                                    <img src={img.preview} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    <button type="button" onClick={() => setMainImage(idx)} className={`absolute bottom-0 w-full py-1 text-[9px] font-black uppercase text-white ${img.isMain ? 'bg-primary' : 'bg-black/30'}`}>{img.isMain ? '대표' : '설정'}</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Menu Management Section */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest ml-1">추천 메뉴 관리</h3>
                            <button type="button" onClick={addMenu} className="text-xs font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg">+ 메뉴 추가</button>
                        </div>
                        
                        <div className="space-y-4">
                            {menus.map((menu, idx) => (
                                <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-white rounded-2xl flex-shrink-0 relative overflow-hidden border border-slate-200">
                                            {menu.preview ? (
                                                <img src={menu.preview} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <span className="material-symbols-outlined">image</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleMenuImageUpload(idx, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input type="text" value={menu.name} onChange={(e) => updateMenu(idx, 'name', e.target.value)} placeholder="메뉴 이름" className="w-full px-3 py-2 bg-white rounded-xl text-sm font-bold border border-slate-100 outline-none focus:border-primary" />
                                            <input type="text" value={menu.price} onChange={(e) => updateMenu(idx, 'price', e.target.value)} placeholder="가격 (예: 12,000원)" className="w-full px-3 py-2 bg-white rounded-xl text-sm font-bold border border-slate-100 outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                    <textarea value={menu.description} onChange={(e) => updateMenu(idx, 'description', e.target.value)} placeholder="메뉴 설명을 입력하세요" className="w-full h-16 px-3 py-2 bg-white rounded-xl text-xs font-medium border border-slate-100 outline-none focus:border-primary resize-none" />
                                    <button type="button" onClick={() => removeMenu(idx)} className="w-full text-[11px] font-bold text-rose-400 py-1">삭제하기</button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">전체 메뉴판 이미지</label>
                            <label className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative">
                                {menuBoardImage ? (
                                    <>
                                        <img src={menuBoardImage.preview} className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-600">sync</span>
                                            <span className="text-xs text-slate-600 font-bold mt-1">이미지 변경</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-slate-300">menu_book</span>
                                        <span className="text-xs text-slate-400 font-bold mt-1">메뉴판 사진 올리기</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleMenuBoardUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg active:scale-95 transition-all disabled:bg-slate-300 mb-10">
                        {saving ? (
                            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                수정 완료하기
                            </>
                        )}
                    </button>
                </form>
            </main>
            <BottomNav />
        </>
    );
};

export default BusinessEdit;
