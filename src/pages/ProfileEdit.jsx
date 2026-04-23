import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ProfileEdit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nickname: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileView, setProfileView] = useState(null);

    // Image Resizing Utility
    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Web 용으로 압축된 JPEG 생성 (품질 0.8)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
            };
        });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('sky_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData(prev => ({ ...prev, nickname: parsed.nickname }));
            if (parsed.profile_image) {
                setProfileView(parsed.profile_image);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const resizedDataUrl = await resizeImage(file);
                setProfileView(resizedDataUrl);
            } catch (err) {
                console.error("Image resizing failed", err);
                setError("이미지 처리 중 오류가 발생했습니다.");
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('sky_token');
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nickname: formData.nickname,
                    profile_image: profileView,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const contentType = res.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`${res.status} ${res.statusText}: ${text || '서버에서 응답을 받지 못했습니다.'}`);
            }

            if (!res.ok) {
                throw new Error(data.error || '프로필 수정에 실패했습니다.');
            }

            // Update local storage
            localStorage.setItem('sky_user', JSON.stringify(data.user));
            alert('프로필이 성공적으로 수정되었습니다.');
            navigate('/mypage');
        } catch (err) {
            console.error("Profile update error:", err);
            let message = err.message;
            if (message.includes('Unexpected end of JSON input')) {
                message = '서버로부터 빈 응답을 받았습니다. 이미지 크기가 너무 크거나 서버 일시적 오류일 수 있습니다.';
            }
            setError(message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto pt-6 pb-24 px-5 bg-[#F8FAFC] min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">프로필 및 정보 수정</h2>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm font-medium mb-6 flex items-center gap-2 border border-rose-100">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-28 h-28 bg-[#1A4173]/10 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                {profileView ? (
                                    <img src={profileView} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-[48px] text-[#1A4173]/40">person</span>
                                )}
                            </div>
                            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 font-medium">사진을 터치하여 변경하세요</p>
                    </div>

                    {/* Nickname Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">닉네임</label>
                        <input
                            required
                            name="nickname"
                            type="text"
                            value={formData.nickname}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
                            placeholder="변경할 닉네임을 입력하세요"
                        />
                    </div>

                    <div className="h-4"></div>
                    <h3 className="px-1 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">비밀번호 변경</h3>
                    <p className="text-[11px] text-slate-400 mb-4 px-1 leading-relaxed">* 비밀번호 변경이 필요하신 경우에만 입력해 주세요.</p>

                    {/* Password Fields */}
                    <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">현재 비밀번호</label>
                            <input
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                                placeholder="현재 사용중인 비밀번호"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">새 비밀번호</label>
                            <input
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                                placeholder="새로운 비밀번호"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">새 비밀번호 확인</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                                placeholder="새 비밀번호를 다시 입력하세요"
                            />
                            {formData.confirmPassword && (
                                <p className={`text-[11px] mt-1.5 pl-1 font-bold ${formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-rose-500'}`}>
                                    {formData.newPassword === formData.confirmPassword ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-bold mt-10 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? '수정 중...' : '변경 사항 저장하기'}
                    </button>
                </form>
            </main>
            <BottomNav />
        </>
    );
};

export default ProfileEdit;
