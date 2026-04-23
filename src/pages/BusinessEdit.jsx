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
                        address_detail: biz.address_detail || '',
                        church_id: biz.church_id || '',
                        keywords: biz.keywords ? JSON.parse(biz.keywords) : [],
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
                        const existingMenus = data.menus.map((m, idx) => ({
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
        }, 200);
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

    const handleMenuBoardChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const optimized = await optimizeImage(file);
        setMenuBoardImage({
            preview: URL.createObjectURL(optimized),
            file: optimized,
            isExisting: false
        });
    };

    const addMenuItem = () => {
        if (menus.length >= 10) return;
        setMenus([...menus, { name: '', price: '', description: '', preview: null, file: null, isExisting: false, hasImage: false }]);
    };

    const updateMenuItem = (index, field, value) => {
        const newMenus = [...menus];
        newMenus[index][field] = value;
        setMenus(newMenus);
    };

    const handleMenuImageChange = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const optimized = await optimizeImage(file);
        const newMenus = [...menus];
        newMenus[index].file = optimized;
        newMenus[index].preview = URL.createObjectURL(optimized);
        newMenus[index].isExisting = false;
        newMenus[index].hasImage = true;
        setMenus(newMenus);
    };

    const removeMenuItem = (index) => {
        setMenus(menus.filter((_, i) => i !== index));
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
    
    const handleAddressSearch = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        new window.daum.Postcode({
            oncomplete: function(data) {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname !== '') extraAddress += data.bname;
                    if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                    fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                }

                setFormData(prev => ({ ...prev, address: fullAddress }));
                
                setTimeout(() => {
                    const detail = document.getElementById('address_detail');
                    if (detail) detail.focus();
                }, 100);
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

        // 1. Manage Business Images
        const sortedImages = [...images].sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0));
        const existingKeys = sortedImages.filter(img => img.isExisting).map(img => img.key);
        body.append('existing_images', JSON.stringify(existingKeys));
        sortedImages.filter(img => !img.isExisting).forEach(img => {
            body.append('new_images', img.file);
        });

        // 2. Manage Menu Board Image
        if (menuBoardImage) {
            if (menuBoardImage.isExisting) body.append('existing_menu_board', menuBoardImage.key);
            else body.append('new_menu_board', menuBoardImage.file);
        } else {
            body.append('remove_menu_board', 'true');
        }

        // 3. Manage Individual Menus
        const menuDataForJson = menus.map(m => ({
            name: m.name,
            price: m.price,
            description: m.description,
            hasImage: m.hasImage,
            isExisting: m.isExisting,
            existingKey: m.existingKey
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
            <main className="max-w-md mx-auto pt-6 pb-32 px-5 bg-[#F8FAFC] min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">사업체 정보 수정</h2>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm font-medium mb-6 flex items-center gap-2 border border-rose-100 italic transition-all animate-pulse">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Images */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 flex justify-between">
                            <span>사업체 이미지 (최대 10장)</span>
                            <span className={images.length >= 10 ? 'text-rose-500' : ''}>{images.length}/10</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {images.map((img, idx) => (
                                <div key={img.id} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${img.isMain ? 'border-primary' : 'border-slate-100'}`}>
                                    <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(img.id)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                    {!img.isMain && (
                                        <button type="button" onClick={() => setMainImage(img.id)} className="absolute bottom-0 left-0 right-0 py-0.5 bg-black/30 text-[9px] text-white font-bold backdrop-blur-sm">대표설정</button>
                                    )}
                                    {img.isMain && <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-primary text-[9px] text-white font-black rounded-br-lg">대표</div>}
                                </div>
                            ))}
                            {images.length < 10 && (
                                <button type="button" onClick={() => document.getElementById('biz-images').click()} className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-all text-slate-300">
                                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                                    <span className="text-[10px] font-bold mt-1">추가</span>
                                </button>
                            )}
                        </div>
                        <input type="file" id="biz-images" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">상호명 <span className="text-rose-500 font-black">*</span></label>
                            <input required name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">대표자명 <span className="text-rose-500 font-black">*</span></label>
                            <input required name="ceo_name" type="text" value={formData.ceo_name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between items-center">
                                <span>연락처 <span className="text-rose-500 font-black">*</span></span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-400 select-none">
                                    <input type="checkbox" name="show_phone" checked={formData.show_phone} onChange={handleChange} className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary/20" />
                                    상세페이지 노출 안 함
                                </label>
                            </label>
                            <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업자등록번호 <span className="text-rose-500 font-black">*</span></label>
                            <div className="flex gap-2">
                                <input required name="biz_no" type="text" value={formData.biz_no} onChange={handleChange} className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                                <button type="button" onClick={handleBizCheck} disabled={bizStatus.loading || (bizStatus.success && formData.biz_no === formData.original_biz_no)} className={`px-5 rounded-2xl font-bold text-xs shadow-sm transition-all ${bizStatus.success ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-800 text-white active:scale-95'}`}>{bizStatus.loading ? '...' : (bizStatus.success && formData.biz_no === formData.original_biz_no) ? '기존번호' : bizStatus.success ? '확인됨' : '중복확인'}</button>
                            </div>
                            {bizStatus.message && <p className={`text-[11px] font-bold mt-1.5 ml-1 ${bizStatus.success ? 'text-emerald-600' : 'text-rose-500'}`}>{bizStatus.message}</p>}
                        </div>

                        {/* Address Section */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">영업장 주소 <span className="text-rose-500 font-black">*</span></label>
                            <div className="space-y-2">
                                <div className="relative group" onClick={handleAddressSearch}>
                                    <input required readOnly name="address" type="text" value={formData.address} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none group-hover:border-primary transition-all text-slate-800 font-medium cursor-pointer" placeholder="클릭하여 주소를 검색하세요" />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">search</span>
                                </div>
                                <input id="address_detail" name="address_detail" type="text" value={formData.address_detail} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="상세 주소를 입력하세요 (층, 호수 등)" />
                            </div>
                        </div>

                        {/* Church Search */}
                        <div className="space-y-1.5 relative" ref={searchRef}>
                            <label className="text-xs font-bold text-slate-500 ml-1">교회 선택</label>
                            <div className="relative">
                                <input type="text" value={churchSearch} onChange={(e) => { if (formData.church_id) setFormData(prev => ({ ...prev, church_id: '' })); setChurchSearch(e.target.value); }} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium pr-12" placeholder="교회 이름을 검색하여 변경하세요" />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{isSearchingChurches ? 'sync' : 'search'}</span>
                            </div>
                            {churchResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-hidden divide-y divide-slate-50">
                                    {churchResults.map(church => (
                                        <button key={church.id} type="button" onClick={() => { setFormData(prev => ({ ...prev, church_id: church.id })); setChurchSearch(church.name); setChurchResults([]); }} className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5">
                                            <span className="font-bold text-slate-800 text-sm">{church.name}</span>
                                            <span className="text-[11px] text-slate-400 leading-tight">{church.address}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category & Keywords */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">업종 선택 <span className="text-rose-500 font-black">*</span></label>
                            <div className="relative">
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium appearance-none">
                                    <option value="">카테고리를 선택하세요</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between">
                                <span>키워드 입력</span>
                                <span className="text-[10px] text-slate-400">{formData.keywords.length}/10</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2 min-h-[44px] p-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                                {formData.keywords.map(kw => (
                                    <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-white text-primary text-[12px] font-bold rounded-full border border-primary/20 hover:border-primary/50 transition-all shadow-sm">
                                        #{kw}
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))} className="flex items-center text-slate-300 hover:text-rose-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    </span>
                                ))}
                            </div>
                            <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) { e.preventDefault(); const val = keywordInput.trim(); if (formData.keywords.length < 10 && !formData.keywords.includes(val)) { setFormData(prev => ({ ...prev, keywords: [...prev.keywords, val] })); setKeywordInput(''); } } }} disabled={formData.keywords.length >= 10} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="키워드 입력 후 엔터" />
                        </div>

                        {/* NEW: Operating Hours & Parking */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-500 ml-1 underline decoration-primary/30 underline-offset-4">영업시간</label>
                            <input name="operating_hours" type="text" value={formData.operating_hours} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="예: 평일 09:00~20:00 (토요일 휴무)" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 underline decoration-primary/30 underline-offset-4">주차정보</label>
                            <input name="parking_info" type="text" value={formData.parking_info} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" placeholder="예: 건물 뒷편 주차장 이용 가능 (2시간 무료)" />
                        </div>

                        {/* NEW: Menu Board Image */}
                        <div className="pt-4 border-t border-slate-50">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 mb-3 block">메뉴판 이미지</label>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => document.getElementById('menu-board-img').click()} className="w-24 h-24 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-primary/50 transition-all overflow-hidden">
                                    {menuBoardImage ? <img src={menuBoardImage.preview} className="w-full h-full object-cover" /> : <><span className="material-symbols-outlined text-[24px]">menu_book</span><span className="text-[10px] font-bold mt-1">메뉴판</span></>}
                                </button>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">전체 메뉴가 담긴 메뉴판 이미지를 업로드해주세요.</p>
                                    {menuBoardImage && <button type="button" onClick={() => setMenuBoardImage(null)} className="text-[10px] text-rose-500 font-bold mt-1">이미지 삭제</button>}
                                </div>
                            </div>
                            <input type="file" id="menu-board-img" accept="image/*" onChange={handleMenuBoardChange} className="hidden" />
                        </div>

                        {/* NEW: Menu Management System */}
                        <div className="pt-4 border-t border-slate-50 space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">개별 메뉴 관리 (최대 10개)</label>
                                <span className={`text-[10px] font-bold ${menus.length >= 10 ? 'text-rose-500' : 'text-slate-400'}`}>{menus.length}/10</span>
                            </div>
                            <div className="space-y-4">
                                {menus.map((menu, idx) => (
                                    <div key={idx} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 flex gap-4 relative group">
                                        <button type="button" onClick={() => removeMenuItem(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                        <div onClick={() => document.getElementById(`menu-img-${idx}`).click()} className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex-shrink-0 flex items-center justify-center cursor-pointer overflow-hidden text-slate-300 hover:border-primary/50 transition-all">
                                            {menu.preview ? <img src={menu.preview} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined">add_a_photo</span>}
                                        </div>
                                        <input type="file" id={`menu-img-${idx}`} className="hidden" accept="image/*" onChange={(e) => handleMenuImageChange(idx, e)} />
                                        <div className="flex-1 space-y-2">
                                            <input type="text" value={menu.name} onChange={(e) => updateMenuItem(idx, 'name', e.target.value)} placeholder="메뉴명" className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-primary" />
                                            <input type="text" value={menu.price} onChange={(e) => updateMenuItem(idx, 'price', e.target.value)} placeholder="가격 (예: 15,000원)" className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-primary" />
                                            <textarea rows="1" value={menu.description} onChange={(e) => updateMenuItem(idx, 'description', e.target.value)} placeholder="상세 설명" className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-medium outline-none focus:border-primary transition-all resize-none overflow-hidden" />
                                        </div>
                                    </div>
                                ))}
                                {menus.length < 10 && (
                                    <button type="button" onClick={addMenuItem} className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">add_circle</span> 메뉴 추가하기
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Description & Links */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-500 ml-1">사업체 설명</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium resize-none leading-relaxed" placeholder="업체에 대한 상세 설명을 적어주세요."></textarea>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-slate-50">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">소셜 미디어 링크 (선택사항)</h3>
                            <div className="space-y-3">
                                <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">language</span><input name="website" type="url" value={formData.website} onChange={handleChange} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="홈페이지" /></div>
                                <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">video_library</span><input name="youtube" type="url" value={formData.youtube} onChange={handleChange} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="유튜브" /></div>
                                <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">rss_feed</span><input name="blog" type="url" value={formData.blog} onChange={handleChange} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="블로그/포스트" /></div>
                                <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px]">photo_camera</span><input name="instagram" type="text" value={formData.instagram} onChange={handleChange} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="인스타그램" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 pb-12">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 py-5 bg-white text-slate-400 rounded-2xl font-bold hover:bg-slate-50 border border-slate-100 transition-all">취소</button>
                        <button type="submit" disabled={saving || !bizStatus.success} className="flex-[2] py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50">
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '수정 완료하기'}
                        </button>
                    </div>
                </form>
            </main>
            <BottomNav />
        </>
    );
};

export default BusinessEdit;
