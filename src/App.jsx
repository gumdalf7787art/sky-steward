import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Home from './pages/Home';
// 추후 페이지들이 추가될 예정입니다.
import Login from './pages/Login';
import Signup from './pages/Signup';
import CategoryList from './pages/CategoryList';
import MyPage from './pages/MyPage';
// import BusinessRegister from './pages/BusinessRegister';
// import ChurchRegister from './pages/ChurchRegister';
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <div className="bg-background text-on-background font-body-md min-h-screen pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/category/:categoryId" element={<CategoryList />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
