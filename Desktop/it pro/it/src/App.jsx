import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';

// --- SAHIFALAR (PAGES) ---
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Groups } from './pages/Groups';
import { GroupDetails } from './pages/GroupDetails'; // ⚠️ Bu fayl borligini tekshiring!
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';

// --- KOMPONENTLAR ---
import { Sidebar } from './components/Sidebar';

// --- LAYOUT (Himoyalangan Qobiq) ---
// Bu komponent faqat Login qilganlar uchun menyuni va asosiy ekrani ko'rsatadi
const Layout = ({ children }) => {
  const { currentUser } = useData();

  // Agar user tizimga kirmagan bo'lsa, Login sahifasiga haydaymiz
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-[#0f172a]">
      {/* Chap tomon - Sidebar (Menyu) */}
      <Sidebar />

      {/* O'ng tomon - Asosiy Kontent */}
      {/* md:ml-20 bu Sidebar yig'ilganda joy tashlash uchun */}
      <main className="flex-1 md:ml-20 transition-all duration-300 p-4 md:p-8 w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- ASOSIY DASTUR ---
export default function App() {
  return (
    <Router>
      {/* Butun ilova ma'lumotlarni (User, Student, Group) ko'ra olishi uchun DataProvider ga o'raymiz */}
      <DataProvider>
        <Routes>
          
          {/* 1. KIRISH SAHIFASI (Login) */}
          <Route path="/login" element={<Login />} />

          {/* 2. HIMOYALANGAN SAHIFALAR (Layout ichida) */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/students" element={<Layout><Students /></Layout>} />

          {/* --- GURUHLAR YO'LLARI --- */}
          <Route path="/groups" element={<Layout><Groups /></Layout>} />
          
          {/* 🔥 ENG MUHIM JOYI: Guruh ichiga kirish yo'li */}
          <Route path="/groups/:id" element={<Layout><GroupDetails /></Layout>} />

          <Route path="/payments" element={<Layout><Payments /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />

          {/* 3. NOTO'G'RI MANZIL BO'LSA -> LOGIN GA OTIB YUBORISH */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </DataProvider>
    </Router>
  );
}