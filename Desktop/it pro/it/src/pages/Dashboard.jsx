import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, TrendingDown, Wallet, 
  BarChart3, Users, Layers, AlertCircle, 
  Phone, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export const Dashboard = () => {
  const { db, theme } = useData();
  const isDark = theme === 'dark';

  // 1. MA'LUMOTLARNI OLISH
  const students = db?.students || [];
  const groups = db?.groups || [];
  const payments = db?.payments || [];
  const expenses = db?.expenses || []; // <--- 🔥 MUHIM: Chiqimlarni oldik

  // --- 2. REAL HISOB-KITOB ---
  
  // Jami Kirim
  const totalIncome = payments.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  
  // Jami Chiqim
  const totalExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  
  // Sof Foyda
  const netProfit = totalIncome - totalExpense;

  // QARZDORLAR (Mantiq)
  const debtors = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return students.filter(student => {
      const hasPaid = payments.some(p => {
        const parts = p.date.split('.');
        return p.studentId === student.id && 
               Number(parts[1]) === currentMonth && 
               Number(parts[2]) === currentYear;
      });
      return !hasPaid;
    });
  }, [students, payments]);

  // --- 3. GRAFIK UCHUN MA'LUMOT (Dinamik) ---
  const [period, setPeriod] = useState('monthly');
  const [hoveredData, setHoveredData] = useState(null);

  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let data = [];

    // OYLIK GRAFIK
    if (period === 'monthly') {
      const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
      data = months.map((label, i) => ({ label, income: 0 }));
      
      payments.forEach(p => {
        const [d, m, y] = p.date.split('.');
        if (Number(y) === currentYear) data[Number(m) - 1].income += Number(p.amount);
      });
    }
    // YILLIK GRAFIK
    else if (period === 'yearly') {
      const years = [...new Set(payments.map(p => p.date.split('.')[2]))].sort();
      if(years.length === 0) years.push(String(currentYear));
      
      data = years.map(label => ({ label, income: 0 }));
      payments.forEach(p => {
        const y = p.date.split('.')[2];
        const idx = years.indexOf(y);
        if(idx !== -1) data[idx].income += Number(p.amount);
      });
    }
    // HAFTALIK (Oddiy misol)
    else {
      const days = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"];
      data = days.map(label => ({ label, income: 0 }));
      // Bu yerda real haftalik logika bo'lishi kerak, hozircha oddiy vizualizatsiya
      payments.slice(-10).forEach((p, i) => {
         data[i % 7].income += Number(p.amount);
      });
    }

    const maxVal = Math.max(...data.map(d => d.income)) || 1;
    return { data, maxVal };
  }, [payments, period]);

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Boshqaruv Paneli</h1>
          <p className="text-slate-500 font-medium">Bugungi holat: {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Filtr Tugmalari (Ixcham) */}
        <div className={`p-1 rounded-xl flex gap-1 ${isDark ? 'bg-[#161d31] border border-white/10' : 'bg-white border border-slate-200'}`}>
          {['weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                period === p 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-slate-400 hover:text-blue-900 dark:hover:text-white'
              }`}
            >
              {p === 'weekly' ? 'Haftalik' : p === 'monthly' ? 'Oylik' : 'Yillik'}
            </button>
          ))}
        </div>
      </div>

      {/* --- MOLIYA KARTALARI (Payments sahifasi bilan bir xil uslubda) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        {/* 1. Kirim (Teal) */}
        <div className="bg-gradient-to-br from-blue-700 to-teal-800 text-white p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-900/20 group hover:-translate-y-1 transition-all">
          <TrendingUp className="absolute top-4 right-4 opacity-30" size={60}/>
          <div className="relative z-10">
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1 flex items-center gap-2">
                <ArrowUpRight size={14}/> Jami Kirim
              </p>
              <h2 className="text-3xl font-black tracking-tight">+{totalIncome.toLocaleString()}</h2>
          </div>
        </div>

        {/* 2. Chiqim (Indigo - To'q Ko'k/Siyohrang aralash) */}
        <div className="bg-gradient-to-br from-indigo-800 to-blue-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-indigo-900/20 group hover:-translate-y-1 transition-all">
          <TrendingDown className="absolute top-4 right-4 opacity-30" size={60}/>
          <div className="relative z-10">
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1 flex items-center gap-2">
                <ArrowDownRight size={14}/> Jami Chiqim
              </p>
              <h2 className="text-3xl font-black tracking-tight">-{totalExpense.toLocaleString()}</h2>
          </div>
        </div>

        {/* 3. Sof Foyda (Slate) */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-slate-900/30 group hover:-translate-y-1 transition-all">
          <Wallet className="absolute top-4 right-4 opacity-30" size={60}/>
          <div className="relative z-10">
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Wallet size={14}/> Sof Foyda
              </p>
              <h2 className="text-3xl font-black tracking-tight">{netProfit.toLocaleString()}</h2>
          </div>
        </div>

      </div>

      {/* --- ASOSIY GRAFIK --- */}
      <div className={`p-6 rounded-3xl border mb-8 transition-all ${isDark ? 'bg-[#161d31] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-800 rounded-lg"><BarChart3 size={20}/></div>
          <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Dinamika</h3>
        </div>

        <div className="h-56 flex items-end justify-between gap-2 md:gap-4 select-none" onMouseLeave={() => setHoveredData(null)}>
          {chartData.data.map((item, idx) => {
            const heightPercent = (item.income / chartData.maxVal) * 100;
            const isHovered = hoveredData?.label === item.label;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer w-full h-full justify-end relative" onMouseEnter={() => setHoveredData(item)}>
                {/* Bar */}
                <div className="w-full h-[85%] relative flex items-end justify-center rounded-t-lg overflow-hidden bg-slate-100/50 dark:bg-white/5">
                  <div style={{ height: `${heightPercent || 2}%` }} className={`w-full rounded-t-lg transition-all duration-500 ${item.income > 0 ? (isHovered ? 'bg-teal-500' : 'bg-blue-800') : 'bg-slate-200 dark:bg-white/10'}`}></div>
                </div>
                {/* Label */}
                <span className={`text-[10px] font-bold ${isHovered ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- STATISTIKA VA QARZDORLAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHAP TOMON: KICHIK KARTALAR */}
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-md ${isDark ? 'bg-[#161d31] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 font-bold">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">O'quvchilar</p>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{students.length}</h3>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-md ${isDark ? 'bg-[#161d31] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-800 font-bold">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Guruhlar</p>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{groups.length}</h3>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-md ${isDark ? 'bg-[#161d31] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 font-bold">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Qarzdorlar</p>
              <h3 className="text-2xl font-black text-rose-600">{debtors.length}</h3>
            </div>
          </div>
        </div>

        {/* O'NG TOMON: QARZDORLAR JADVALI */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-[#161d31] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
              To'lov Kutilmoqda
            </h3>
            <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold">
              {debtors.length} kishi
            </span>
          </div>

          <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {debtors.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 text-xs font-bold uppercase ${isDark ? 'bg-[#161d31] text-slate-400' : 'bg-white text-slate-500'}`}>
                  <tr>
                    <th className="pb-3">F.I.SH</th>
                    <th className="pb-3">Guruh</th>
                    <th className="pb-3 text-right">Aloqa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {debtors.map((s) => (
                    <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.name}</div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold uppercase">
                          {s.group}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <a 
                          href={`tel:${s.phone}`} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-green-500 hover:text-white text-slate-600 rounded-lg text-xs font-bold transition-all"
                        >
                          <Phone size={14}/> <span>Tel</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                  <TrendingUp size={24}/>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Ajoyib!</h4>
                <p className="text-slate-500 text-xs">Bu oy uchun qarzdorlik yo'q.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};