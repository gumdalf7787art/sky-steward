import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ChurchRegister = () => {
    const navigate = useNavigate();
    const auth = useRecoilValue(authState);
    const setAuth = useSetRecoilState(authState);
    const [isAuthReady, setIsAuthReady] = useState(false);

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
                } else {
                    navigate('/login');
                }
            } catch (err) {
                setIsAuthReady(true); // Fallback
            }
        };
        checkAuth();
    }, [auth.token, navigate, setAuth]);

    const [formData, setFormData] = useState({
        name: '',
        denomination: '',
        address: '',
        address_detail: '',
        phone: '',
        description: ''
    });

    const [images, setImages] = useState([]); // Array of { file, preview, isMain }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addrStatus, setAddrStatus] = useState({ checked: false, loading: false, message: '', success: false });

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
                        if (width > max_size) { height *= max_size / width; width = max_size; }
                    } else {
                        if (height > max_size) { width *= max_size / height; height = max_size; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        const optimizedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
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
                isMain: images.length === 0 && filesToProcess.indexOf(file) === 0
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
            if (prev[index].isMain && filtered.length > 0) { filtered[0].isMain = true; }
            return filtered;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'address') {
            setAddrStatus({ checked: false, loading: false, message: '', success: false });
        }
    };

    const handleAddressSearch = () => {
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
                setAddrStatus({ checked: false, loading: false, message: '', success: false });
                
                // 상세주소 입력칸으로 포커스 이동
                setTimeout(() => {
                    document.getElementById('address_detail').focus();
                }, 100);
            }
        }).open();
    };

    const handleAddrCheck = async () => {
        if (!formData.address) {
            alert('주소를 입력해주세요.');
            return;
        }
        setAddrStatus(prev => ({ ...prev, loading: true, message: '' }));
        try {
            const res = await fetch('/api/churches/check-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: formData.address })
            });
            const data = await res.json();
            if (data.isDuplicate) {
                setAddrStatus({ checked: true, loading: false, message: `이미 등록된 교회입니다: ${data.churchName}`, success: false });
            } else {
                setAddrStatus({ checked: true, loading: false, message: '등록 가능한 주소입니다.', success: true });
            }
        } catch (err) {
            setAddrStatus({ checked: false, loading: false, message: '확인 중 오류가 발생했습니다.', success: false });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.denomination || !formData.address || !formData.phone) {
            setError('필수 항목(* 표시)을 모두 입력해주세요.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!addrStatus.success) {
            setError('주소 중복 확인을 해주세요.');
            return;
        }

        setLoading(true);
        const body = new FormData();
        Object.keys(formData).forEach(key => body.append(key, formData[key]));
        
        const sortedImages = [...images].sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0));
        sortedImages.forEach(img => body.append('images', img.file));

        try {
            const res = await fetch('/api/churches/register', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.token || localStorage.getItem('sky_token')}` },
                body
            });
            const data = await res.json();
            if (res.ok) {
                alert('교회 등록이 완료되었습니다!');
                navigate('/mypage');
            } else {
                setError(data.error || '등록 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setError('서버와 통신에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthReady) return null;

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto pt-6 pb-32 px-5 bg-[#F8FAFC] min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">교회 등록</h2>
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
                            <span>교회 이미지 (최대 10장)</span>
                            <span className={images.length >= 10 ? 'text-rose-500' : ''}>{images.length}/10</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {images.map((img, idx) => (
                                <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${img.isMain ? 'border-amber-500' : 'border-slate-100'}`}>
                                    <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                    {!img.isMain && (
                                        <button type="button" onClick={() => setMainImage(idx)} className="absolute bottom-0 left-0 right-0 py-0.5 bg-black/30 text-[9px] text-white font-bold backdrop-blur-sm">대표설정</button>
                                    )}
                                    {img.isMain && (
                                        <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-amber-500 text-[9px] text-white font-black rounded-br-lg">대표</div>
                                    )}
                                </div>
                            ))}
                            {images.length < 10 && (
                                <button type="button" onClick={() => document.getElementById('church-images').click()} className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-amber-500/50 transition-all text-slate-300">
                                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                                    <span className="text-[10px] font-bold mt-1">추가</span>
                                </button>
                            )}
                        </div>
                        <input type="file" id="church-images" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">교회명 <span className="text-rose-500 font-black">*</span></label>
                            <input required name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-100 border border-slate-300 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition-all text-slate-800 font-medium" placeholder="교회 이름을 입력하세요" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">교단 <span className="text-rose-500 font-black">*</span></label>
                            <input required name="denomination" type="text" value={formData.denomination} onChange={handleChange} className="w-full px-5 py-4 bg-slate-100 border border-slate-300 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition-all text-slate-800 font-medium" placeholder="교단명을 입력하세요 (예: 예장통합)" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">주소 <span className="text-rose-500 font-black">*</span></label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group" onClick={handleAddressSearch}>
                                        <input 
                                            required 
                                            readOnly
                                            name="address" 
                                            type="text" 
                                            value={formData.address} 
                                            className="w-full px-5 py-4 bg-slate-100 border border-slate-300 rounded-2xl outline-none group-hover:border-amber-500 transition-all text-slate-800 font-medium cursor-pointer" 
                                            placeholder="주소를 검색하세요" 
                                        />
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">search</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddrCheck} 
                                        disabled={addrStatus.loading || addrStatus.success || !formData.address} 
                                        className={`px-5 rounded-2xl font-bold text-xs shadow-sm transition-all ${addrStatus.success ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-800 text-white active:scale-95 disabled:opacity-50'}`}
                                    >
                                        {addrStatus.loading ? '...' : addrStatus.success ? '확인됨' : '중복확인'}
                                    </button>
                                </div>
                                <input 
                                    id="address_detail"
                                    name="address_detail" 
                                    type="text" 
                                    value={formData.address_detail} 
                                    onChange={handleChange} 
                                    className="w-full px-5 py-4 bg-slate-100 border border-slate-300 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition-all text-slate-800 font-medium" 
                                    placeholder="상세 주소를 입력하세요 (층, 호수 등)" 
                                />
                            </div>
                            {addrStatus.message && (
                                <p className={`text-[11px] font-bold mt-1.5 ml-1 ${addrStatus.success ? 'text-emerald-600' : 'text-rose-500'}`}>{addrStatus.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1">연락처 <span className="text-rose-500 font-black">*</span></label>
                            <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-slate-100 border border-slate-300 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition-all text-slate-800 font-medium" placeholder="교회 사무실 또는 담당자 번호" />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between">
                                <span>교회 소개</span>
                                <span className={formData.description.length > 1000 ? 'text-rose-500' : 'text-slate-400'}>{formData.description.length}/1000</span>
                            </label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" maxLength="1000" className="w-full px-5 py-4 bg-slate-100 border border-slate-300 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition-all text-slate-800 font-medium resize-none leading-relaxed" placeholder="교회에 대해 상세히 소개해주세요."></textarea>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 pb-12">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 py-5 bg-white text-slate-400 rounded-2xl font-bold hover:bg-slate-100 border border-slate-300 shadow-sm transition-all">취소</button>
                        <button type="submit" disabled={loading} className="flex-[2] py-5 bg-amber-500 text-white rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '교회 등록하기'}
                        </button>
                    </div>
                </form>
            </main>
            <BottomNav />
        </>
    );
};

export default ChurchRegister;
