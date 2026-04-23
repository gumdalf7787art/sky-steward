import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authState } from '../atoms/auth';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const BusinessManage = () => {
    const navigate = useNavigate();
    const auth = useRecoilValue(authState);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchBusinesses = async () => {
            try {
                const res = await fetch('/api/business/list', {
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setBusinesses(data.businesses || []);
                } else {
                    setError(data.error || '목록을 불러오는 데 실패했습니다.');
                }
            } catch (err) {
                setError('서버와 연결할 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [auth, navigate]);

    const handleDelete = async (bizId, bizName) => {
        if (!confirm(`'${bizName}' 업체를 정말 삭제하시겠습니까? 관련 데이터(상세 정보, 리뷰 등)가 모두 삭제됩니다.`)) {
            return;
        }

        try {
            const res = await fetch('/api/business/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ businessId: bizId })
            });
            const data = await res.json();
            if (data.success) {
                alert('업체가 성공적으로 삭제되었습니다.');
                // Update local status
                setBusinesses(prev => prev.filter(b => b.id !== bizId));
            } else {
                alert(data.error || '삭제 중 오류가 발생했습니다.');
            }
        } catch (err) {
            alert('서버와 통신하는 중 오류가 발생했습니다.');
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
                    <h2 className="text-xl font-bold text-slate-800">등록 업체 관리</h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 mt-4 font-medium">목록을 불러오는 중...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 text-rose-500 p-5 rounded-2xl border border-rose-100 text-center">
                        <span className="material-symbols-outlined text-4xl mb-2">error</span>
                        <p className="font-bold">{error}</p>
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm px-10 text-center">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-[40px]">storefront</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">등록된 업체가 없습니다</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            아직 등록된 사업장이 없으시네요!<br />새로운 업체를 등록해 보세요.
                        </p>
                        <Link 
                            to="/mypage/business-register"
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
                        >
                            사업자 등록하기
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">총 {businesses.length}개 업체</span>
                            <Link to="/mypage/business-register" className="text-xs font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                추가 등록
                            </Link>
                        </div>
                        
                        {businesses.map((biz) => (
                            <div key={biz.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                                            {biz.images && JSON.parse(biz.images).length > 0 ? (
                                                <img 
                                                    src={`/api/media/${JSON.parse(biz.images)[0]}`} 
                                                    alt={biz.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-300 text-[28px]">store</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg mb-0.5">{biz.name}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{biz.category}</p>
                                        </div>
                                    </div>
                                    <div className="inline-flex px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                        Active
                                    </div>
                                </div>
                                
                                <div className="space-y-2 border-t border-slate-50 pt-4 mb-4">
                                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                                        <span className="material-symbols-outlined text-[16px] text-slate-300">badge</span>
                                        <span>{biz.biz_no}</span>
                                    </div>
                                    {biz.address && (
                                        <div className="flex items-start gap-2 text-[13px] text-slate-500 leading-tight">
                                            <span className="material-symbols-outlined text-[16px] text-slate-300 mt-0.5">location_on</span>
                                            <span>{biz.address}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <Link 
                                        to={`/mypage/business-edit/${biz.id}`}
                                        className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center"
                                    >
                                        관리/수정
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(biz.id, biz.name)}
                                        className="w-12 h-11 flex items-center justify-center bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <BottomNav />
        </>
    );
};

export default BusinessManage;
