import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ChurchManage = () => {
    const navigate = useNavigate();
    const auth = useRecoilValue(authState);
    
    // States
    const [churches, setChurches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Edit Mode States
    const [isEditing, setIsEditing] = useState(false);
    const [currentChurch, setCurrentChurch] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        denomination: '',
        address: '',
        phone: '',
        description: ''
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchMyChurches();
    }, [auth, navigate]);

    const fetchMyChurches = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/churches/mine', {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setChurches(data.churches || []);
            } else {
                setError(data.error || '목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('서버와 통신하는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (church) => {
        setCurrentChurch(church);
        setEditForm({
            name: church.name || '',
            denomination: church.denomination || '',
            address: church.address || '',
            phone: church.phone || '',
            description: church.description || ''
        });
        setExistingImages(church.images ? JSON.parse(church.images) : []);
        setNewImages([]);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!confirm('정말로 이 교회를 삭제하시겠습니까? 등록된 모든 정보가 사라집니다.')) return;
        
        try {
            const res = await fetch(`/api/churches/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            if (res.ok) {
                alert('교회가 삭제되었습니다.');
                fetchMyChurches();
            } else {
                const data = await res.json();
                alert(data.error || '삭제 중 오류가 발생했습니다.');
            }
        } catch (err) {
            alert('서버 통신 오류');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('denomination', editForm.denomination);
        formData.append('address', editForm.address);
        formData.append('phone', editForm.phone);
        formData.append('description', editForm.description);
        formData.append('existing_images', JSON.stringify(existingImages));
        
        newImages.forEach(img => {
            formData.append('new_images', img.file);
        });

        try {
            const res = await fetch(`/api/churches/${currentChurch.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${auth.token}` },
                body: formData
            });

            if (res.ok) {
                alert('수정이 완료되었습니다!');
                setIsEditing(false);
                fetchMyChurches();
            } else {
                const data = await res.json();
                alert(data.error || '수정 중 오류가 발생했습니다.');
            }
        } catch (err) {
            alert('서버 통신 오류');
        } finally {
            setSaving(false);
        }
    };

    const removeExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImgs = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setNewImages(prev => [...prev, ...newImgs]);
    };

    const removeNewImage = (idx) => {
        setNewImages(prev => prev.filter((_, i) => i !== idx));
    };

    if (loading && !isEditing) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium">교회 목록을 불러오고 있습니다...</p>
        </div>
    );

    return (
        <>
            <Header />
            <main className="max-w-md mx-auto pt-6 pb-24 px-5 bg-[#F8FAFC] min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => isEditing ? setIsEditing(false) : navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600"
                    >
                        <span className="material-symbols-outlined">{isEditing ? 'close' : 'arrow_back'}</span>
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? '교회 정보 수정' : '등록 교회 관리'}
                    </h2>
                </div>

                {!isEditing ? (
                    /* LIST VIEW */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">총 {churches.length}개 교회</span>
                            <Link to="/mypage/church-register" className="text-xs font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                교회 추가 등록
                            </Link>
                        </div>

                        {churches.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm px-10 text-center">
                                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-[40px]">church</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">등록된 교회가 없습니다</h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed">아직 등록하신 교회가 없으시네요!<br />새로운 교회를 등록해 보세요.</p>
                                <Link to="/mypage/church-register" className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md">교회 등록하기</Link>
                            </div>
                        ) : (
                            churches.map((church) => (
                                <div key={church.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm transition-all group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                                            {church.images && JSON.parse(church.images).length > 0 ? (
                                                <img src={`/api/media/${JSON.parse(church.images)[0]}`} alt={church.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-300">church</span>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-slate-800 text-lg truncate">{church.name}</h4>
                                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase">{church.denomination}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium truncate italic">{church.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditClick(church)}
                                            className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                            관리/수정
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(church.id)}
                                            className="w-12 h-11 flex items-center justify-center bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* EDIT VIEW (Form Inline) */
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">교회 이름</label>
                                <input required type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">교단/소속</label>
                                <input required type="text" value={editForm.denomination} onChange={(e) => setEditForm({...editForm, denomination: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">주소</label>
                                <input required type="text" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">연락처</label>
                                <input required type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">설명</label>
                                <textarea rows="3" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-primary transition-all text-slate-800 font-medium resize-none" />
                            </div>

                            {/* Image Management */}
                            <div className="space-y-3 pt-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">교회 이미지 관리</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Existing Images */}
                                    {existingImages.map((img, idx) => (
                                        <div key={`ex-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={`/api/media/${img}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-0 right-0 p-1 bg-black/50 text-white"><span className="material-symbols-outlined text-[12px]">close</span></button>
                                        </div>
                                    ))}
                                    {/* New Images Previews */}
                                    {newImages.map((img, idx) => (
                                        <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-primary/30">
                                            <img src={img.preview} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-0 right-0 p-1 bg-primary text-white"><span className="material-symbols-outlined text-[12px]">delete</span></button>
                                        </div>
                                    ))}
                                    {existingImages.length + newImages.length < 5 && (
                                        <button type="button" onClick={() => document.getElementById('new-imgs').click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined">add_a_photo</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" id="new-imgs" multiple accept="image/*" className="hidden" onChange={handleNewImageChange} />
                            </div>
                        </div>

                        <div className="flex gap-3 pb-10">
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-bold border border-slate-100">취소</button>
                            <button type="submit" disabled={saving} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '수정사항 저장하기'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
            <BottomNav />
        </>
    );
};

export default ChurchManage;
