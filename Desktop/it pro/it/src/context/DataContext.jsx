import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const load = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crm_user')); } catch { return null; }
  });

  const [students, setStudents] = useState(() => load('crm_students'));
  const [groups, setGroups] = useState(() => load('crm_groups'));
  const [payments, setPayments] = useState(() => load('crm_payments'));
  
  // 🔥 YANGI: CHIQIMLAR BAZASI
  const [expenses, setExpenses] = useState(() => load('crm_expenses'));
  
  const [theme, setTheme] = useState(localStorage.getItem('crm_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('crm_user', JSON.stringify(currentUser));
    localStorage.setItem('crm_students', JSON.stringify(students));
    localStorage.setItem('crm_groups', JSON.stringify(groups));
    localStorage.setItem('crm_payments', JSON.stringify(payments));
    
    // 🔥 YANGI: SAQLASH
    localStorage.setItem('crm_expenses', JSON.stringify(expenses));
    
    localStorage.setItem('crm_theme', theme);
  }, [currentUser, students, groups, payments, expenses, theme]);

  const login = (u, p) => {
    if (u === 'ayewedu_AX' && p === 'ayew_edu_AX') {
      setCurrentUser({ username: 'Director', role: 'admin' });
      return { success: true };
    }
    return { success: false, message: 'Parol xato' };
  };

  const logout = () => { setCurrentUser(null); window.location.reload(); };

  // --- CRUD ---
  const addStudent = (st) => setStudents(prev => [...prev, { ...st, id: Date.now() }]);
  const updateStudent = (st) => setStudents(prev => prev.map(s => s.id === st.id ? st : s));
  const deleteStudent = (id) => setStudents(prev => prev.filter(s => s.id !== id));
  
  const addGroup = (gr) => setGroups(prev => [...prev, { ...gr, id: Date.now() }]);
  const updateGroup = (updatedGroup) => {
    const oldGroup = groups.find(g => g.id === updatedGroup.id);
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    if (oldGroup && oldGroup.name !== updatedGroup.name) {
       setStudents(prev => prev.map(s => s.group === oldGroup.name ? { ...s, group: updatedGroup.name } : s));
    }
  };
  const deleteGroup = (id) => setGroups(prev => prev.filter(g => g.id !== id));
  
  const addPayment = (pay) => setPayments(prev => [...prev, { ...pay, id: Date.now(), date: new Date().toLocaleDateString() }]);

  // 🔥 YANGI: CHIQIM QO'SHISH VA O'CHIRISH
  const addExpense = (exp) => setExpenses(prev => [...prev, { ...exp, id: Date.now(), date: new Date().toLocaleDateString() }]);
  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <DataContext.Provider value={{
      currentUser, 
      db: { students, groups, payments, expenses }, // <-- expenses ni qo'shdik
      login, logout, theme, toggleTheme,
      addStudent, updateStudent, deleteStudent,
      addGroup, updateGroup, deleteGroup, 
      addPayment, addExpense, deleteExpense // <-- export qildik
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);