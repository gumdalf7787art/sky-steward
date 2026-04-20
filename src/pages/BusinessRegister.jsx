import React, { useState, useEffect } from 'react';
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
    biz_no: '',
    category: '',
    phone: '',
    address: '',
    church_id: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  ];

  useEffect(() => {
    // Fetch churches
    fetch('/api/churches/list')
      .then(res => res.json())
      .then(data => {
        if (data.churches) setChurches(data.churches);
      })
      .catch(err => console.error('Failed to load churches', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.biz_no || !formData.category) {
      setError('필수 항목(* 표시)을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    const body = new FormData();
    Object.keys(formData).forEach(key => {
      body.append(key, formData[key]);
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
        alert('사업장 등록이 완료되었습니다!');
        // Update local auth state to BIZ
        setAuth(prev => ({
          ...prev,
          user: { ...prev.user, role: 'BIZ' }
        }));
        navigate('/mypage');
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
      <main className="max-w-md mx-auto pt-4 pb-24 bg-surface min-h-screen">
        <div className="px-margin-mobile flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-3 text-on-surface">
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
          </button>
          <h2 className="text-headline-md font-headline-md text-primary">사업장 등록</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-margin-mobile flex flex-col gap-5">
          
          {/* Image Upload Area */}
          <div className="flex flex-col gap-2">
            <label className="text-label-lg font-bold text-on-surface">대표 이미지</label>
            <div 
              onClick={() => document.getElementById('biz-image').click()}
              className="w-full h-48 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[48px] text-outline mb-2">add_a_photo</span>
                  <p className="text-body-md text-outline">사진 업로드 (클릭)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              id="biz-image" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4 bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg font-bold text-on-surface">상호명 <span className="text-error">*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="사업체 이름을 입력하세요"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg font-bold text-on-surface">사업자등록번호 <span className="text-error">*</span></label>
              <input 
                type="text" 
                name="biz_no"
                value={formData.biz_no}
                onChange={handleChange}
                placeholder="000-00-00000"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-primary" 
              />
              <p className="text-[11px] text-outline pl-1">등록 시 중복 여부를 체크합니다.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg font-bold text-on-surface">업종 선택 <span className="text-error">*</span></label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-primary appearance-none"
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg font-bold text-on-surface">연락처 <span className="text-error">*</span></label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="예: 010-1234-5678"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg font-bold text-on-surface">사업장 주소</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="상세 주소를 입력하세요"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-lg font-bold text-on-surface">소속 교회 선택</label>
              <select 
                name="church_id"
                value={formData.church_id}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-primary appearance-none"
              >
                <option value="">교회를 선택하세요 (나중에 선택 가능)</option>
                {churches.map(church => (
                  <option key={church.id} value={church.id}>{church.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-error text-center text-body-md animate-fadeIn">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-headline-md font-bold text-on-primary bg-primary shadow-lg active:scale-[0.98] transition-all mb-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? '등록 중...' : '사업장 등록하기'}
          </button>
        </form>
      </main>
      <BottomNav />
    </>
  );
};

export default BusinessRegister;
