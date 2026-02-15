import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  UserPlus, Trash2, Search, X, 
  Phone, Users, GraduationCap, Edit, 
  CreditCard, CheckCircle2, XCircle, DollarSign,
  Calendar, Layers
} from 'lucide-react';

export const Students = () => {
  const { db, addStudent, deleteStudent, updateStudent, addPayment, theme } = useData();
  const isDark = theme === 'dark';

  // --- STATELAR ---
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ name: '', phone: '', group: '' });
  const [editForm, setEditForm] = useState({ id: null, name: '', phone: '', group: '' });
  
  const [payStudent, setPayStudent] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const students = db?.students || [];
  const groups = db?.groups || [];
  const payments = db?.payments || [];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  // --- FUNKSIYALAR ---
  const checkPaid = (sId) => {
    const d = new Date();
    return payments.some(p => {
       const parts = p.date.split('.');
       return p.studentId === sId && Number(parts[1]) === d.getMonth() + 1 && Number(parts[2]) === d.getFullYear();
    });
  };

  const getGroupPrice = (groupName) => {
    const group = groups.find(g => g.name === groupName);
    return group ? group.price : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.group) return alert("Guruhni tanlang!");
    addStudent(form);
    setForm({ name: '', phone: '', group: '' });
    setAddModalOpen(false);
  };

  const openEditModal = (s) => { setEditForm(s); setEditModalOpen(true); };
  const handleEditSubmit = (e) => { e.preventDefault(); updateStudent(editForm); setEditModalOpen(false); };

  const openPayModal = (s) => {
    setPayStudent(s);
    setPayAmount(getGroupPrice(s.group));
    setPayModalOpen(true);
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (payStudent && payAmount) {
      addPayment({ studentId: payStudent.id, studentName: payStudent.name, amount: payAmount, date: new Date().toLocaleDateString() });
      setPayModalOpen(false);
      alert("To'lov qabul qilindi!");
    }
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className={`text-3xl font-black flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            O'quvchilar 
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-blue-900 text-white shadow-lg shadow-blue-900/20">
              {students.length}
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">O'quvchilar kartotekasi</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Qidiruv */}
          <div className={`relative flex items-center px-4 py-3 rounded-2xl border w-full md:w-64 transition-all focus-within:ring-2 focus-within:ring-blue-900/20 ${isDark ? 'bg-[#161d31] border-white/10' : 'bg-white border-slate-200'}`}>
             <Search size={20} className="text-slate-400 mr-2"/>
             <input 
               placeholder="Qidirish..." 
               className={`bg-transparent outline-none w-full font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>

          {/* Qo'shish Tugmasi */}
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 active:scale-95 transition"
          >
            <UserPlus size={20} /> <span className="hidden md:inline">Qo'shish</span>
          </button>
        </div>
      </div>

      {/* --- KARTALAR (GURUH USLUBIDA) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {filteredStudents.length > 0 ? filteredStudents.map((s) => {
           const isPaid = checkPaid(s.id);

           return (
             <div key={s.id} className={`group relative p-6 rounded-[32px] border transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#161d31] to-[#0f172a] border-white/5' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100'}`}>
                
                {/* ORQA FON BEZAGI (Guruhlardagi kabi) */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <Users size={180} />
                </div>

                {/* 1. Header: Ism */}
                <div className="relative z-10 flex justify-between items-start mb-6">
                   <div>
                      <h3 className={`text-2xl font-black leading-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.name}</h3>
                      <p className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded inline-block">
                        ID: {s.id.toString().slice(-4)}
                      </p>
                   </div>
                   {/* Status Dumaloq */}
                   <div className={`w-4 h-4 rounded-full shadow-[0_0_10px] ${isPaid ? 'bg-emerald-500 shadow-emerald-500' : 'bg-rose-500 shadow-rose-500'}`}></div>
                </div>

                {/* 2. Info Bloklar (Guruh va Tel) */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                   
                   {/* Guruh Bloki */}
                   <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Layers size={14}/> <span className="text-[10px] font-bold uppercase">Guruh</span>
                      </div>
                      <div className="font-black text-blue-900 dark:text-blue-400 truncate">
                        {s.group || "Guruhsiz"}
                      </div>
                   </div>

                   {/* Telefon Bloki */}
                   <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Phone size={14}/> <span className="text-[10px] font-bold uppercase">Aloqa</span>
                      </div>
                      <div className={`font-bold text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {s.phone}
                      </div>
                   </div>

                </div>

                {/* 3. Status Matni */}
                <div className={`relative z-10 flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {isPaid ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                   {isPaid ? "30 kunga to'landi" : "To'lov qilinmagan"}
                </div>

                {/* 4. Tugmalar (Actions) */}
                <div className="relative z-10 flex gap-2">
                   {/* TO'LOV (Katta) */}
                   <button 
                     onClick={() => openPayModal(s)}
                     className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition"
                   >
                     <DollarSign size={18}/> To'lash
                   </button>
                   
                   {/* Kichik tugmalar */}
                   <button onClick={() => openEditModal(s)} className={`p-3 rounded-xl transition border ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/5' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}>
                     <Edit size={18}/>
                   </button>
                   <button onClick={() => { if(confirm("O'chirasizmi?")) deleteStudent(s.id) }} className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-100">
                     <Trash2 size={18}/>
                   </button>
                </div>

             </div>
           )
        }) : (
          <div className="col-span-full py-20 text-center">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
               <GraduationCap size={40} className="text-slate-400"/>
             </div>
             <h3 className="text-xl font-bold text-slate-600">O'quvchilar topilmadi</h3>
             <p className="text-slate-400 mt-2">Yangi o'quvchi qo'shish uchun tugmani bosing</p>
          </div>
        )}

      </div>

      {/* --- MODALLAR (O'zgarishsiz qoldi, faqat dizayni moslandi) --- */}
      
      {/* 1. QO'SHISH */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className={`w-full max-w-md p-8 rounded-[32px] shadow-2xl ${isDark ? 'bg-[#161d31] border border-white/10' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi O'quvchi</h2>
              <button onClick={() => setAddModalOpen(false)}><X className="text-slate-400 hover:text-rose-500"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-slate-100'}`} placeholder="Ism Familiya" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-slate-100'}`} placeholder="Telefon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              <select className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-slate-100'}`} value={form.group} onChange={e => setForm({...form, group: e.target.value})} required>
                  <option value="" className="text-slate-400">Guruhni tanlang...</option>
                  {groups.map(g => <option key={g.id} value={g.name} className="text-black">{g.name}</option>)}
              </select>
              <button className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg text-lg">Saqlash</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TAHRIRLASH */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className={`w-full max-w-md p-8 rounded-[32px] shadow-2xl ${isDark ? 'bg-[#161d31] border border-white/10' : 'bg-white'}`}>
            <h2 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Tahrirlash</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-slate-100'}`} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              <input className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-slate-100'}`} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              <select className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-slate-100'}`} value={editForm.group} onChange={e => setEditForm({...editForm, group: e.target.value})}>
                  {groups.map(g => <option key={g.id} value={g.name} className="text-black">{g.name}</option>)}
              </select>
              <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg">Yangilash</button>
              <button type="button" onClick={() => setEditModalOpen(false)} className="w-full py-3 text-slate-500 font-bold">Bekor</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. TO'LOV */}
      {isPayModalOpen && payStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className={`w-full max-w-sm p-8 rounded-[32px] shadow-2xl ${isDark ? 'bg-[#161d31] border border-white/10' : 'bg-white'}`}>
            <div className="text-center mb-8">
               <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-blue-900/30">
                 <DollarSign size={40}/>
               </div>
               <h3 className={`font-black text-2xl ${isDark?'text-white':'text-slate-900'}`}>To'lov Qilish</h3>
               <p className="text-slate-500 mt-2 font-medium">{payStudent.name}</p>
            </div>
            <form onSubmit={handlePaySubmit}>
              <div className="mb-6">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Summa</label>
                 <input type="number" className={`w-full p-5 mt-2 rounded-2xl border-2 outline-none font-black text-3xl text-center text-blue-900 ${isDark ? 'bg-[#0b1120] border-white/5 text-white' : 'bg-slate-50 border-blue-100'}`} value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <button className="w-full py-5 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-lg shadow-blue-900/30 text-xl">Tasdiqlash</button>
            </form>
            <button onClick={() => setPayModalOpen(false)} className="w-full mt-4 text-slate-400 font-bold hover:text-slate-600">Bekor qilish</button>
          </div>
        </div>
      )}

    </div>
  );
};