import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Bell, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  X,
  Users,
  Edit,
  Trash2,
  Save,
  KeyRound,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  MoreVertical,
  CheckSquare,
  Square,
  Moon,
  Sun
} from 'lucide-react';

// --- External Libraries ---
// INSTRUCTIONS: Uncomment these imports in your local VS Code after running 'npm install xlsx jspdf jspdf-autotable'
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// INSTRUCTIONS: Delete these two lines in your local VS Code when you enable the imports above
// const XLSX = null;
// const jsPDF = null;

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

// --- Firebase Configuration (Secure Environment Variables) ---
// Note: Ensure you have created a .env file in your project root with these keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (Conditional check to prevent crashing if keys are missing in preview)
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
// eslint-disable-next-line no-unused-vars
} catch (error) {
  console.warn("Firebase not initialized. Check your .env file.");
}

// --- Mock Data (For Seeding Only) ---
const INITIAL_USERS = [
  { name: 'Administrator', email: 'admin', password: 'admin', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user' }
];

const CATEGORIES = ['Entertainment', 'Software', 'Infrastructure', 'AI Tools', 'Health', 'Education', 'Utilities'];

const CYCLE_OPTIONS = [
  '1 Month', '3 Months', '4 Months', '6 Months', '1 Year', '2 Years', '3 Years', '4 Years', '5 Years'
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getDaysUntil = (dateString) => {
  const today = new Date();
  const target = new Date(dateString);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// --- Components ---

// Skeleton Loader Component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
);

// Footer Component
const Footer = () => (
  <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500 w-full mt-auto border-t border-transparent dark:border-gray-800">
    &copy; {new Date().getFullYear()} All rights reserved | Designed and developed by <a href="https://github.com/sibintb" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300">CBn</a>
  </div>
);

// 1. Login Component
const Login = ({ onLogin, users, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const validUser = users.find(u => (u.email === email || u.email === 'admin') && u.password === password);
    
    if (validUser) {
      onLogin(validUser);
    } else {
      setError('Invalid credentials.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 relative transition-colors duration-200">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SubManager</h2>
            <p className="text-gray-500 dark:text-gray-400">Sign in to manage your licenses</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email / Username</label>
              <input 
                type="text" 
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input 
                type="password" 
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// 2. Subscription Modal
const SubscriptionModal = ({ isOpen, onClose, onSave, subscription, onDelete }) => {
  const [formData, setFormData] = useState(() => {
    if (subscription) return subscription;
    return {
      name: '',
      price: '',
      cycle: '1 Month',
      nextPayment: new Date().toISOString().split('T')[0],
      category: 'Software',
      active: true
    };
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, price: parseFloat(formData.price) || 0 });
  };

  const handleDelete = () => {
    if(window.confirm('Are you sure you want to delete this subscription?')) {
      onDelete(subscription.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {subscription ? 'Manage Subscription' : 'New Subscription'}
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
            <input required className="w-full px-3 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
              <input type="number" step="0.01" required className="w-full px-3 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycle</label>
              <select className="w-full px-3 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})}>
                {CYCLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select className="w-full px-3 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Payment</label>
              <input type="date" required className="w-full px-3 py-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.nextPayment} onChange={e => setFormData({...formData, nextPayment: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
             <input type="checkbox" id="activeStatus" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
             <label htmlFor="activeStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription is Active</label>
          </div>
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
            {subscription && (
              <button type="button" onClick={handleDelete} className="w-full md:w-auto px-4 py-3 md:py-2 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg md:mr-auto flex items-center justify-center gap-2 border md:border-none border-red-100 dark:border-red-900/30">
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button type="button" onClick={onClose} className="w-full md:w-auto px-4 py-3 md:py-2 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" className="w-full md:w-auto px-4 py-3 md:py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 flex items-center justify-center gap-2 transition-colors">
              <Save size={16} /> {subscription ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. User Management Component
const UserManagement = ({ users, onAddUser, onDeleteUser, onResetPassword, loading }) => {
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [resetUser, setResetUser] = useState(null);
  const [resetPass, setResetPass] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if(newUser.name && newUser.email && newUser.password) {
      onAddUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
    }
  };

  const submitReset = (e) => {
    e.preventDefault();
    if(resetPass) {
      onResetPassword(resetUser.id, resetPass);
      setResetUser(null);
      setResetPass('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New User</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-end">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Jane Doe" required /></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="jane@example.com" required /></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="******" required /></div>
          <div className="w-full md:w-32"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
             <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
               <option value="user">User</option><option value="admin">Admin</option></select></div>
          <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 flex justify-center items-center"><Plus size={20} /> <span className="md:hidden ml-2">Add User</span></button>
        </form>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-48 h-3" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {users.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                    <div><div className="font-medium text-gray-900 dark:text-white">{u.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{u.role.toUpperCase()}</span></div>
                    <div className="flex gap-1">
                      <button onClick={() => setResetUser(u)} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-300"><KeyRound size={18} /></button>
                      {u.email !== 'admin' && (<button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:text-red-700 dark:hover:text-red-300"><Trash2 size={18} /></button>)}
                    </div></div>))}
            </div>
            <table className="hidden md:table w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700"><tr><th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th><th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th><th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th><th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.name}</td><td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{u.role.toUpperCase()}</span></td>
                    <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2">
                        <button onClick={() => setResetUser(u)} className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-1" title="Reset Password"><KeyRound size={18} /></button>
                        {u.email !== 'admin' && (<button onClick={() => onDeleteUser(u.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1" title="Delete User"><Trash2 size={18} /></button>)}
                      </div></td></tr>))}
              </tbody></table>
          </>
        )}
      </div>
      {resetUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Reset Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter new password for <b>{resetUser.name}</b></p>
            <form onSubmit={submitReset}>
              <input type="password" autoFocus className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="New Password" value={resetPass} onChange={e => setResetPass(e.target.value)} required />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => {setResetUser(null); setResetPass('')}} className="px-4 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500">Update</button>
              </div></form></div></div>)}
    </div>
  );
};

// 4. Stats & Chart Components
// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, subtext, icon: Icon, colorClass, loading }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
      {loading ? (
        <div className="w-full">
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-16 h-8 mb-1" />
          <Skeleton className="w-32 h-3" />
        </div>
      ) : (
        <>
          <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>{subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}</div>
          <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}><Icon size={24} className={colorClass.replace('bg-', 'text-')} /></div>
        </>
      )}
  </div>
);

const CategoryChart = ({ data, loading }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Spending by Category</h3>
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
              <Skeleton className="w-full h-2.5 rounded-full" />
            </div>
          ))
        ) : (
          data.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600 dark:text-gray-300">{item.label}</span><span className="text-gray-900 dark:text-white font-bold">${item.value.toFixed(2)}</span></div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(item.value / maxVal) * 100}%` }}></div></div>
            </div>))
        )}
      </div>
    </div>
  );
};

// 5. Mobile Subscription Card
const MobileSubscriptionCard = ({ sub, onEdit, isSelected, onToggleSelect }) => (
  <div className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 relative ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-800'}`}>
    <div className="absolute top-4 right-4 z-10">
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleSelect(sub.id); }}
        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300"
      >
        {isSelected ? <CheckSquare size={24} className="text-indigo-600 dark:text-indigo-400" /> : <Square size={24} />}
      </button>
    </div>
    <div onClick={() => onEdit(sub)}>
      <div className="flex justify-between items-start mb-2 pr-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-lg">{sub.name.charAt(0)}</div>
          <div><h4 className="font-semibold text-gray-900 dark:text-white">{sub.name}</h4><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-2">{sub.category}</span></div>
        </div>
        <div className="text-right"><div className="font-bold text-gray-900 dark:text-white">${sub.price}</div><div className="text-xs text-gray-500 dark:text-gray-400">{sub.cycle}</div></div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">Due: <span className="font-medium">{formatDate(sub.nextPayment)}</span></div>
        <div className="flex items-center gap-2"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sub.active ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{sub.active ? 'Active' : 'Inactive'}</span><ChevronDown size={16} className="text-gray-400" /></div>
      </div>
    </div>
  </div>
);

// 6. Desktop Table Header
const SortableHeader = ({ label, sortKey, sortConfig, onSort }) => (
  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none" onClick={() => onSort(sortKey)}>
    <div className="flex items-center gap-1">{label}
      {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : (<ArrowUpDown size={14} className="text-gray-300 dark:text-gray-600" />)}
    </div>
  </th>
);

// 7. Main Application Container
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  
  // Persist User Session in Local Storage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('submanager_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('submanager_theme');
    return saved === 'dark'; // Default to light if not set
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'nextPayment', direction: 'asc' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);
  const actionsRef = useRef(null);
  const categoryRef = useRef(null);

  // Apply Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('submanager_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('submanager_theme', 'light');
    }
  }, [darkMode]);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('submanager_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('submanager_user_session');
    }
  }, [user]);

  // Click outside handler logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- 1. Firebase Auth ---
  useEffect(() => {
    // Timeout fallback for loading state
    const timer = setTimeout(() => setLoading(false), 2500);

    // Initialize Firebase Auth
    if (app) {
      signInAnonymously(auth).catch(console.error);
      const unsubscribe = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
      return () => {
        unsubscribe();
        clearTimeout(timer);
      };
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, []);

  // --- 2. Data Synchronization (Real-time) ---
  useEffect(() => {
    if (!firebaseUser || !db) return;

    // A. Sync Users
    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_USERS.forEach(async (u) => await addDoc(collection(db, 'users'), u));
      } else {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    });

    // B. Sync Subscriptions
    const subsQuery = query(collection(db, 'subscriptions'));
    const unsubSubs = onSnapshot(subsQuery, (snapshot) => {
       setSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       if (!snapshot.empty) setLoading(false);
    });

    return () => { unsubUsers(); unsubSubs(); };
  }, [firebaseUser]);

  // --- Logic ---
  const stats = useMemo(() => {
    const totalMonthly = subscriptions.filter(s => s.active && s.cycle.includes('Month')).reduce((acc, curr) => acc + curr.price, 0);
    const activeCount = subscriptions.filter(s => s.active).length;
    const expiringCount = subscriptions.filter(s => {
      const days = getDaysUntil(s.nextPayment);
      return days >= 0 && days <= 7 && s.active;
    }).length;
    return { totalMonthly, activeCount, expiringCount };
  }, [subscriptions]);

  const categoryData = useMemo(() => {
    const data = {};
    subscriptions.forEach(sub => {
      if (!sub.active) return;
      if (!data[sub.category]) data[sub.category] = 0;
      data[sub.category] += sub.price;
    });
    return Object.keys(data).map(key => ({ label: key, value: data[key] }));
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];
    if (filterCategory !== 'All') result = result.filter(s => s.category === filterCategory);
    if (searchTerm) result = result.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (typeof aValue === 'string') { aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase(); }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [subscriptions, filterCategory, searchTerm, sortConfig]);

  const notifications = useMemo(() => {
    return subscriptions.filter(s => s.active).map(s => ({ ...s, daysLeft: getDaysUntil(s.nextPayment) }))
      .filter(s => s.daysLeft <= 7 && s.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  const handleLogout = () => setUser(null);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- Selection Handlers ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubscriptions.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected subscriptions?`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteDoc(doc(db, 'subscriptions', id))));
        setSelectedIds([]);
        alert("Deleted successfully.");
      } catch (error) {
        console.error("Delete error", error);
        alert("Error deleting some items.");
      }
    }
  };

  // --- Export & Import Functions ---

  const exportToCSV = () => {
    const header = ["name", "price", "cycle", "category", "nextPayment", "active", "currency"];
    const rows = filteredSubscriptions.map(sub => [
      sub.name, sub.price, sub.cycle, sub.category, sub.nextPayment, sub.active, sub.currency || 'USD'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + header.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscriptions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowActions(false);
  };

  const exportToExcel = () => {
    if (!XLSX) {
      alert("Error: 'xlsx' library not found. Please follow the instructions in the code comments to enable this feature locally.");
      return;
    }
    try {
      // eslint-disable-next-line no-unused-vars
      const dataToExport = filteredSubscriptions.map(({ id, ...rest }) => rest);
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");
      XLSX.writeFile(wb, "subscriptions_export.xlsx");
      setShowActions(false);
    } catch (e) {
      console.error(e);
      alert("Error exporting Excel.");
    }
  };

  const exportToPDF = () => {
    if (!jsPDF) {
      alert("Error: 'jspdf' library not found. Please follow the instructions in the code comments to enable this feature locally.");
      return;
    }
    try {
      const doc = new jsPDF();
      doc.text("Subscription Report", 14, 15);
      
      const tableColumn = ["Name", "Price", "Cycle", "Category", "Next Payment", "Active"];
      const tableRows = [];

      filteredSubscriptions.forEach(sub => {
        const subData = [
          sub.name,
          `${sub.price} ${sub.currency || 'USD'}`,
          sub.cycle,
          sub.category,
          sub.nextPayment,
          sub.active ? "Yes" : "No"
        ];
        tableRows.push(subData);
      });

      // Check if autoTable is available on the doc object
      if (doc.autoTable) {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 20,
        });
        doc.save("subscriptions_export.pdf");
      } else {
        // Fallback for when autoTable isn't attached directly to the instance
        // This handles cases where the import might attach it differently
        alert("Error: jspdf-autotable plugin not correctly loaded.");
      }
      
      setShowActions(false);
    } catch (e) {
      console.error(e);
      alert("Error exporting PDF: " + e.message);
    }
  };

  const downloadTemplate = () => {
    const header = ["name", "price", "cycle", "category", "nextPayment", "active"];
    const example = ["Netflix Example", "15.99", "1 Month", "Entertainment", "2024-12-31", "true"];
    const csvContent = "data:text/csv;charset=utf-8," + header.join(",") + "\n" + example.join(",");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowActions(false);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
    setShowActions(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert("File is too large. Maximum size allowed is 2MB.");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) {
        alert("Invalid file content. Must include headers and at least one data row.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ["name", "price", "cycle", "category", "nextPayment", "active"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        alert(`Invalid format. Missing columns: ${missingHeaders.join(", ")}. Please use the template.`);
        return;
      }
      
      const validSubs = lines.slice(1).map(line => {
        if (!line.trim()) return null;
        const values = line.split(',').map(v => v.trim());
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index];
        });
        
        return {
          name: entry.name || "Unknown",
          price: parseFloat(entry.price) || 0,
          cycle: entry.cycle || "1 Month",
          category: entry.category || "Other",
          nextPayment: entry.nextPayment || new Date().toISOString().split('T')[0],
          active: entry.active === "true" || entry.active === true,
          currency: 'USD'
        };
      }).filter(item => item !== null);

      if (validSubs.length > 0) {
        if (window.confirm(`Found ${validSubs.length} valid subscriptions. Import now?`)) {
          validSubs.forEach(async (sub) => {
            await addDoc(collection(db, 'subscriptions'), sub);
          });
          alert("Import started.");
        }
      } else {
        alert("No valid data found.");
      }
    };
    reader.readAsText(file); 
    e.target.value = null;
  };


  // --- CRUD Handlers (Firestore) ---
  const handleSaveSubscription = async (subData) => {
    const isEdit = !!editingSub;
    const docId = editingSub?.id;
    setIsSubModalOpen(false);
    setEditingSub(null);

    try {
      if (isEdit) {
        await updateDoc(doc(db, 'subscriptions', docId), subData);
      } else {
        await addDoc(collection(db, 'subscriptions'), subData);
      }
    } catch (e) {
      console.error("Error saving:", e);
      alert("Failed to save changes in background. Please check connection.");
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
      setIsSubModalOpen(false);
      setEditingSub(null);
    } catch (e) {
      console.error("Error deleting:", e);
      alert("Failed to delete.");
    }
  };

  const handleAddUser = async (userData) => {
    try { await addDoc(collection(db, 'users'), userData); } 
    catch (e) { console.error(e); alert("Failed to add user."); }
  };

  const handleDeleteUser = async (id) => {
    try { await deleteDoc(doc(db, 'users', id)); } 
    catch (e) { console.error(e); alert("Failed to delete user."); }
  };

  const handleResetPassword = async (id, newPassword) => {
    try { await updateDoc(doc(db, 'users', id), { password: newPassword }); alert('Updated'); } 
    catch (e) { console.error(e); alert("Failed to update."); }
  };

  if (!user) return <Login onLogin={setUser} users={users} loading={loading} />;

  const openAddModal = () => { setEditingSub(null); setIsSubModalOpen(true); };
  const openEditModal = (sub) => { setEditingSub(sub); setIsSubModalOpen(true); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 transition-colors duration-200 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-lg"><CreditCard className="text-white" size={20} /></div><span className="text-xl font-bold text-gray-800 dark:text-white">SubManager</span></div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => setCurrentView('list')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'list' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><CreditCard size={20} /> Subscriptions</button>
          {user.role === 'admin' && (<button onClick={() => setCurrentView('users')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'users' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><Users size={20} /> Users</button>)}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2"><div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold uppercase">{user.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user.role}</p></div><button onClick={handleLogout} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"><LogOut size={18} /></button></div>
          {/* Dark Mode Toggle in Sidebar */}
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 md:px-6 pt-12 pb-4 lg:py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white capitalize">{currentView}</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative"><button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"><Bell size={20} className="text-gray-600 dark:text-gray-300" />{notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}</button>
              {showNotifications && (<div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20"><div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"><span className="font-semibold text-sm text-gray-800 dark:text-white">Notifications</span><button onClick={() => setShowNotifications(false)}><X size={14} className="text-gray-500 dark:text-gray-400" /></button></div>{notifications.length === 0 ? (<div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">No upcoming payments</div>) : (notifications.map(sub => (<div key={sub.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"><AlertCircle size={16} className="text-amber-500 mt-1 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-800 dark:text-white">Payment due for {sub.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">Due in {sub.daysLeft} days • ${sub.price}</p></div></div>)))}</div>)}</div>
            <button className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" onClick={handleLogout}><LogOut size={20} /></button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"><StatCard title="Monthly Spend" value={`$${stats.totalMonthly.toFixed(2)}`} subtext="Active monthly subs" icon={TrendingUp} colorClass="bg-green-500" loading={loading} /><StatCard title="Active Subs" value={stats.activeCount} subtext="Total active services" icon={CheckCircle} colorClass="bg-blue-500" loading={loading} /><StatCard title="Expiring Soon" value={stats.expiringCount} subtext="Due in 7 days" icon={AlertCircle} colorClass="bg-amber-500" loading={loading} /></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"><CategoryChart data={categoryData} loading={loading} /><div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"><div className="flex justify-between items-center mb-4 md:mb-6"><h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upcoming Payments</h3><button onClick={() => setCurrentView('list')} className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">View All</button></div><div className="space-y-3">{loading ? [1,2,3].map(i => <div key={i} className="flex justify-between p-3"><Skeleton className="w-8 h-8 rounded-full" /><div className="flex-1 ml-3"><Skeleton className="w-24 h-4 mb-1" /><Skeleton className="w-16 h-3" /></div><Skeleton className="w-12 h-4" /></div>) : filteredSubscriptions.slice(0, 4).map(sub => (<div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center text-lg shadow-sm font-bold text-gray-500 dark:text-gray-300">{sub.name.charAt(0)}</div><div><p className="font-medium text-gray-900 dark:text-white">{sub.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(sub.nextPayment)}</p></div></div><span className="font-semibold text-gray-900 dark:text-white">${sub.price}</span></div>))}</div></div></div>
              </div>
            )}

            {currentView === 'list' && (
              <div className="space-y-4 md:space-y-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} /><input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                    <div className="relative" ref={categoryRef}>
                      <button onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between gap-2 min-w-[180px]"><span>{filterCategory === 'All' ? 'All Categories' : filterCategory}</span><ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} /></button>
                      {showCategoryDropdown && (<div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1 max-h-60 overflow-y-auto">
                          <button onClick={() => { setFilterCategory('All'); setShowCategoryDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 ${filterCategory === 'All' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>All Categories</button>
                          {CATEGORIES.map(c => (<button key={c} onClick={() => { setFilterCategory(c); setShowCategoryDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 ${filterCategory === c ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>{c}</button>))}</div>)}</div>
                    <div className="relative" ref={actionsRef}>
                      <button onClick={() => setShowActions(!showActions)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between gap-2 min-w-[140px]"><span>Actions</span><ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${showActions ? 'rotate-180' : ''}`} /></button>
                      {showActions && (<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1">
                          <button onClick={exportToCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><FileText size={16} /> Export to CSV</button>
                          <button onClick={exportToExcel} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><FileSpreadsheet size={16} /> Export to Excel</button>
                          <button onClick={exportToPDF} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Download size={16} /> Export to PDF</button>
                          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                          <button onClick={downloadTemplate} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Download size={16} /> Download Template</button>
                          <button onClick={handleImportClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Upload size={16} /> Import Data</button></div>)}</div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
                    {selectedIds.length > 0 && (<button onClick={handleDeleteSelected} className="px-3 py-2.5 bg-red-50 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center gap-2 animate-fade-in"><Trash2 size={18} /> <span>Delete ({selectedIds.length})</span></button>)}
                    <button onClick={openAddModal} className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 flex items-center justify-center gap-2"><Plus size={18} /> <span className="md:inline">Add New</span></button></div></div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {loading ? (
                    <div className="p-4 space-y-4">
                      <div className="md:hidden space-y-4">
                        {[1, 2, 3].map((i) => (<div key={i} className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"><div className="flex justify-between mb-2"><div className="flex gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div><Skeleton className="w-32 h-4 mb-1" /><Skeleton className="w-20 h-3" /></div></div><div className="text-right"><Skeleton className="w-16 h-4 mb-1 ml-auto" /><Skeleton className="w-12 h-3 ml-auto" /></div></div><div className="flex justify-between mt-3"><Skeleton className="w-24 h-3" /><Skeleton className="w-16 h-5 rounded-full" /></div></div>))}
                      </div>
                      <div className="hidden md:block">
                         <table className="w-full">
                           <thead><tr className="border-b border-gray-200 dark:border-gray-700">{[1,2,3,4,5,6,7].map(i => <th key={i} className="px-6 py-4"><Skeleton className="w-20 h-4" /></th>)}</tr></thead>
                           <tbody>{[1, 2, 3, 4, 5].map((i) => (<tr key={i}><td className="px-6 py-4"><Skeleton className="w-4 h-4" /></td><td className="px-6 py-4"><div className="flex gap-3"><Skeleton className="w-8 h-8 rounded" /><Skeleton className="w-32 h-4" /></div></td><td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td><td className="px-6 py-4"><Skeleton className="w-20 h-4" /></td><td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td><td className="px-6 py-4"><Skeleton className="w-20 h-4 rounded-full" /></td><td className="px-6 py-4"><Skeleton className="w-16 h-4 rounded-full" /></td><td className="px-6 py-4 text-right"><Skeleton className="w-20 h-8 ml-auto rounded" /></td></tr>))}</tbody></table></div></div>
                  ) : (
                    <>
                      <div className="md:hidden">{filteredSubscriptions.map(sub => (<MobileSubscriptionCard key={sub.id} sub={sub} onEdit={openEditModal} isSelected={selectedIds.includes(sub.id)} onToggleSelect={handleSelectOne} />))}{filteredSubscriptions.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-gray-400">No subscriptions found.</div>}</div>
                      <div className="hidden md:block overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700"><tr><th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" checked={filteredSubscriptions.length > 0 && selectedIds.length === filteredSubscriptions.length} onChange={handleSelectAll} /></th><SortableHeader label="Service" sortKey="name" sortConfig={sortConfig} onSort={requestSort} /><SortableHeader label="Cost" sortKey="price" sortConfig={sortConfig} onSort={requestSort} /><SortableHeader label="Cycle" sortKey="cycle" sortConfig={sortConfig} onSort={requestSort} /><SortableHeader label="Next Payment" sortKey="nextPayment" sortConfig={sortConfig} onSort={requestSort} /><SortableHeader label="Category" sortKey="category" sortConfig={sortConfig} onSort={requestSort} /><SortableHeader label="Status" sortKey="active" sortConfig={sortConfig} onSort={requestSort} /><th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th></tr></thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{filteredSubscriptions.map(sub => (<tr key={sub.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedIds.includes(sub.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}><td className="px-6 py-4 text-center"><input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" checked={selectedIds.includes(sub.id)} onChange={() => handleSelectOne(sub.id)} /></td><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">{sub.name.charAt(0)}</div><span className="font-medium text-gray-900 dark:text-white">{sub.name}</span></div></td><td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${sub.price}</td><td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{sub.cycle}</td><td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(sub.nextPayment)}</td><td className="px-6 py-4"><span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{sub.category}</span></td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${sub.active ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{sub.active ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 text-right"><button onClick={() => openEditModal(sub)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-sm font-medium transition-colors"><Edit size={14} /> Manage</button></td></tr>))}</tbody></table>{filteredSubscriptions.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-gray-400">No subscriptions found.</div>}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {currentView === 'users' && user.role === 'admin' && (
              <UserManagement users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onResetPassword={handleResetPassword} loading={loading} />
            )}
          </div>
          <Footer />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between p-2 z-30 gap-2">
        <button onClick={() => setCurrentView('dashboard')} className={`flex-1 flex flex-col items-center py-2 rounded-lg ${currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400'}`}><LayoutDashboard size={20} /><span className="text-[10px] mt-1">Home</span></button>
        <button onClick={() => setCurrentView('list')} className={`flex-1 flex flex-col items-center py-2 rounded-lg ${currentView === 'list' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400'}`}><CreditCard size={20} /><span className="text-[10px] mt-1">Subs</span></button>
        <button onClick={() => setDarkMode(!darkMode)} className={`flex-1 flex flex-col items-center py-2 rounded-lg text-gray-500 dark:text-gray-400`}><div className="relative">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</div><span className="text-[10px] mt-1">{darkMode ? 'Light' : 'Dark'}</span></button>
        {user.role === 'admin' && (<button onClick={() => setCurrentView('users')} className={`flex-1 flex flex-col items-center py-2 rounded-lg ${currentView === 'users' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400'}`}><Users size={20} /><span className="text-[10px] mt-1">Users</span></button>)}
      </nav>

      {isSubModalOpen && (
        <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} onSave={handleSaveSubscription} onDelete={handleDeleteSubscription} subscription={editingSub} />
      )}
    </div>
  );
}