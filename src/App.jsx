import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import AuthInitializer from './components/AuthInitializer';
// 추후 페이지들이 추가될 예정입니다.
import Login from './pages/Login';
import Signup from './pages/Signup';
import CategoryList from './pages/CategoryList';
import MyPage from './pages/MyPage';
import ProfileEdit from './pages/ProfileEdit';
import BusinessRegister from './pages/BusinessRegister';
import BusinessEdit from './pages/BusinessEdit';
import BusinessManage from './pages/BusinessManage';
import ChurchRegister from './pages/ChurchRegister';
import ChurchManage from './pages/ChurchManage';
import BusinessDetail from './pages/BusinessDetail';
import ChurchDetail from './pages/ChurchDetail';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import CategoryExplorer from './pages/CategoryExplorer';

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <ScrollToTop />
        <AuthInitializer />
        <div className="bg-background text-on-background font-body-md min-h-screen pb-24 max-w-[640px] mx-auto shadow-2xl relative border-x border-slate-200 dark:border-slate-800">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/category/:categoryId" element={<CategoryList />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/profile-edit" element={<ProfileEdit />} />
            <Route path="/mypage/business-register" element={<BusinessRegister />} />
            <Route path="/mypage/business-edit/:businessId" element={<BusinessEdit />} />
            <Route path="/mypage/business-manage" element={<BusinessManage />} />
            <Route path="/mypage/church-register" element={<ChurchRegister />} />
            <Route path="/mypage/church-manage" element={<ChurchManage />} />
            <Route path="/business/:id" element={<BusinessDetail />} />
            <Route path="/church/:id" element={<ChurchDetail />} />
            <Route path="/category-explorer" element={<CategoryExplorer />} />
          </Routes>
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
