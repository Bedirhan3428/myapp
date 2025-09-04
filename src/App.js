import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set, get, remove } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALGUXLIpQ5wbqCJcZC8evok7EozY9S1GM",
  authDomain: "veresiye-da80e.firebaseapp.com",
  projectId: "veresiye-da80e",
  storageBucket: "veresiye-da80e.firebasestorage.app",
  messagingSenderId: "435662001889",
  appId: "1:435662001889:web:ec6dfed726649cabda09a0"
};

const ADMIN_CODE = "235046";

const App = () => {
    // State variables
    const [customers, setCustomers] = useState([]);
    const [totalDebt, setTotalDebt] = useState(0);
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [viewMode, setViewMode] = useState('customer'); // Default view

    // Form inputs state
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerLimit, setNewCustomerLimit] = useState('');
    const [debtCustomerCode, setDebtCustomerCode] = useState('');
    const [debtAmount, setDebtAmount] = useState('');
    const [paymentCustomerCode, setPaymentCustomerCode] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    
    // Autocomplete states
    const [searchCustomer, setSearchCustomer] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    
    // Search & filter states for the customer list
    const [searchListQuery, setSearchListQuery] = useState('');
    const [filteredCustomerList, setFilteredCustomerList] = useState([]);
    
    // Customer panel state
    const [customerPanelCode, setCustomerPanelCode] = useState('');
    const [customerPanelData, setCustomerPanelData] = useState(null);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    
    // Edit modal state
    const [editModal, setEditModal] = useState({ 
        isVisible: false, 
        customer: null, 
        newName: '', 
        newLimit: '' 
    });

    // Modal state
    const [modal, setModal] = useState({ isVisible: false, title: '', message: '' });
    
    // Confirmation modal state for deletion
    const [confirmModal, setConfirmModal] = useState({ isVisible: false, customerToDelete: null });

    // Firebase refs
    const dbRef = useRef(null);
    const authRef = useRef(null);
    const searchRef = useRef(null);

    // Helper functions
    const showModal = (title, message) => {
        setModal({ isVisible: true, title, message });
    };

    const closeModal = () => {
        setModal({ isVisible: false, title: '', message: '' });
    };
    
    const showConfirmModal = (customer) => {
        setConfirmModal({ isVisible: true, customerToDelete: customer });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isVisible: false, customerToDelete: null });
    };
    
    const showEditModal = (customer) => {
        setEditModal({
            isVisible: true,
            customer,
            newName: customer.ad,
            newLimit: customer.limit
        });
    };

    const closeEditModal = () => {
        setEditModal({ isVisible: false, customer: null, newName: '', newLimit: '' });
    };

    // Firebase initialization and authentication
    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        dbRef.current = getDatabase(app);
        authRef.current = getAuth(app);

        const checkAdminStatus = async (currentUser) => {
            if (currentUser) {
                const adminRef = ref(dbRef.current, 'admin_config/uid');
                const snapshot = await get(adminRef);
                const adminUid = snapshot.val();
                if (adminUid === currentUser.uid) {
                    setIsAdmin(true);
                    localStorage.setItem('isAdmin', 'true');
                } else if (!adminUid) {
                    await set(adminRef, currentUser.uid);
                    setIsAdmin(true);
                    localStorage.setItem('isAdmin', 'true');
                } else {
                    setIsAdmin(false);
                    localStorage.removeItem('isAdmin');
                }
            } else {
                setIsAdmin(false);
                localStorage.removeItem('isAdmin');
            }
            setIsAuthLoading(false);
        };

        const unsubscribe = onAuthStateChanged(authRef.current, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await checkAdminStatus(currentUser);
            } else {
                setIsAuthLoading(false);
                const localIsAdmin = localStorage.getItem('isAdmin');
                if (localIsAdmin === 'true') {
                    setIsAdmin(false);
                    localStorage.removeItem('isAdmin');
                }
            }
        });
        
        const localIsAdmin = localStorage.getItem('isAdmin');
        if (localIsAdmin === 'true' && user) {
             setIsAdmin(true);
        }

        return () => unsubscribe();
    }, [user]);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(authRef.current, provider);
        } catch (error) {
            console.error("Google ile giriş hatası:", error);
            showModal('Hata', 'Google ile giriş yapılırken bir sorun oluştu.');
        }
    };

    // Fetch and listen to customer data
    useEffect(() => {
        if (!dbRef.current) return;

        const customersRef = ref(dbRef.current, 'customers');
        const unsubscribe = onValue(customersRef, (snapshot) => {
            const data = snapshot.val();
            const customersData = data ? Object.values(data) : [];
            let currentTotalDebt = 0;

            const updatedCustomers = customersData.map(customer => {
                const now = new Date();
                const dueDate = new Date(customer.son_odeme_tarihi);
                const diffDays = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
                
                let durum = "zamanında";
                if (customer.borc > 0 && diffDays > 0) {
                     durum = diffDays > 30 ? "kronik" : "gecikmiş";
                }
                
                currentTotalDebt += customer.borc;
                return { ...customer, durum };
            });
            
            updatedCustomers.sort((a, b) => b.borc - a.borc);
            setCustomers(updatedCustomers);
            setTotalDebt(currentTotalDebt);
        }, (error) => {
            console.error("Realtime DB'den veri çekme hatası:", error);
            showModal('Hata', 'Müşteri verileri yüklenirken bir sorun oluştu.');
        });
        
        return () => unsubscribe();
    }, []);
    
    // Filter customers for autocomplete
    useEffect(() => {
        if (searchCustomer) {
            const filtered = customers.filter(customer =>
                customer.ad.toLowerCase().startsWith(searchCustomer.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    }, [searchCustomer, customers]);
    
    // Filter customer list based on search query
    useEffect(() => {
        const filtered = customers.filter(customer =>
            customer.ad.toLowerCase().includes(searchListQuery.toLowerCase()) ||
            customer.musteri_kodu.toString().includes(searchListQuery)
        );
        setFilteredCustomerList(filtered);
    }, [searchListQuery, customers]);

    // Form handlers
    const generateCustomerCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    const handleSelectCustomer = (customer) => {
        setDebtCustomerCode(customer.musteri_kodu);
        setSearchCustomer(customer.ad);
        setFilteredCustomers([]);
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!newCustomerName) {
            showModal('Hata', 'Lütfen bir müşteri adı girin.');
            return;
        }

        try {
            const newCustomerCode = generateCustomerCode();
            const now = new Date();
            const sonOdemeTarihi = new Date(now.getFullYear(), now.getMonth(), 21);
            
            const customerRef = ref(dbRef.current, `customers/${newCustomerCode}`);
            await set(customerRef, {
                ad: newCustomerName,
                limit: Number(newCustomerLimit) || 50,
                borc: 0,
                son_odeme_tarihi: sonOdemeTarihi.toISOString().split('T')[0],
                faiz_uygulama_tarihi: null,
                musteri_kodu: newCustomerCode
            });
            showModal('Başarılı', `'${newCustomerName}' adlı müşteri başarıyla eklendi. Müşteri kodu: ${newCustomerCode}`);
            setNewCustomerName('');
            setNewCustomerLimit('');
        } catch (error) {
            console.error("Müşteri ekleme hatası:", error);
            showModal('Hata', 'Müşteri eklenirken bir sorun oluştu.');
        }
    };
    
    const handleAddDebt = async (e) => {
        e.preventDefault();
        if (!debtCustomerCode || isNaN(debtAmount) || parseFloat(debtAmount) <= 0) {
            showModal('Hata', 'Lütfen geçerli müşteri kodu ve miktarı girin.');
            return;
        }

        try {
            const customerRef = ref(dbRef.current, `customers/${debtCustomerCode}`);
            const snapshot = await get(customerRef);
            if (!snapshot.exists()) {
                showModal('Hata', `Kodu '${debtCustomerCode}' olan müşteri bulunamadı.`);
                return;
            }

            const data = snapshot.val();
            const newDebt = data.borc + parseFloat(debtAmount);

            if (newDebt > data.limit) {
                showModal('Hata', 'Limit aşıldı! İşlem reddedildi.');
                return;
            }

            await set(customerRef, { ...data, borc: newDebt });
            showModal('Başarılı', `'${data.ad}' adlı müşterinin borcuna ${debtAmount} TL eklendi.`);
            setDebtCustomerCode('');
            setDebtAmount('');
            setSearchCustomer('');
        } catch (error) {
            console.error("Borç ekleme hatası:", error);
            showModal('Hata', 'Borç eklenirken bir sorun oluştu.');
        }
    };

    const handleMakePayment = async (e) => {
        e.preventDefault();
        if (!paymentCustomerCode || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
            showModal('Hata', 'Lütfen geçerli müşteri kodu ve miktarı girin.');
            return;
        }

        try {
            const customerRef = ref(dbRef.current, `customers/${paymentCustomerCode}`);
            const snapshot = await get(customerRef);
            if (!snapshot.exists()) {
                showModal('Hata', `Kodu '${paymentCustomerCode}' olan müşteri bulunamadı.`);
                return;
            }

            const data = snapshot.val();
            const newDebt = Math.max(0, data.borc - parseFloat(paymentAmount));
            
            await set(customerRef, { ...data, borc: newDebt });
            showModal('Başarılı', `'${data.ad}' adlı müşterinin borcundan ${paymentAmount} TL düşüldü.`);
            setPaymentCustomerCode('');
            setPaymentAmount('');
        } catch (error) {
            console.error("Ödeme yapma hatası:", error);
            showModal('Hata', 'Ödeme yapılırken bir sorun oluştu.');
        }
    };
    
    const handleApplyInterest = async () => {
        if (!dbRef.current) {
            showModal('Hata', 'Veritabanı bağlantısı henüz kurulmadı.');
            return;
        }

        try {
            const customersRef = ref(dbRef.current, 'customers');
            const snapshot = await get(customersRef);
            const customersData = snapshot.val();
            let updatedCount = 0;

            if (customersData) {
                const now = new Date();
                const updates = {};
                
                Object.keys(customersData).forEach((key) => {
                    const customerData = customersData[key];
                    const dueDate = new Date(customerData.son_odeme_tarihi);
                    const lastInterestDate = customerData.faiz_uygulama_tarihi ? new Date(customerData.faiz_uygulama_tarihi) : null;
                    
                    const hasInterestBeenAppliedThisMonth = lastInterestDate && 
                                                           lastInterestDate.getMonth() === now.getMonth() && 
                                                           lastInterestDate.getFullYear() === now.getFullYear();

                    if (customerData.borc > 0 && now > dueDate && !hasInterestBeenAppliedThisMonth) {
                        const newBorc = customerData.borc * 1.05;
                        updates[`customers/${key}/borc`] = newBorc;
                        updates[`customers/${key}/faiz_uygulama_tarihi`] = now.toISOString().split('T')[0];
                        updatedCount++;
                    }
                });
                if (Object.keys(updates).length > 0) {
                    await set(ref(dbRef.current), updates);
                }
            }

            showModal('Faiz Uygulama', `Toplam ${updatedCount} müşterinin borcuna faiz uygulandı.`);
        } catch (error) {
            console.error("Faiz uygulama hatası:", error);
            showModal('Hata', 'Faizler uygulanırken bir sorun oluştu.');
        }
    };
    
    const handleDeleteCustomer = async () => {
        const { musteri_kodu, ad } = confirmModal.customerToDelete;
        
        try {
            const customerRef = ref(dbRef.current, `customers/${musteri_kodu}`);
            await remove(customerRef);
            showModal('Başarılı', `'${ad}' adlı müşteri başarıyla silindi.`);
            closeConfirmModal();
        } catch (error) {
            console.error("Müşteri silme hatası:", error);
            showModal('Hata', 'Müşteri silinirken bir sorun oluştu.');
            closeConfirmModal();
        }
    };
    
    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        const { musteri_kodu } = editModal.customer;
        const newName = editModal.newName;
        const newLimit = editModal.newLimit;

        if (!newName || !newLimit) {
            showModal('Hata', 'Ad ve limit alanları boş bırakılamaz.');
            return;
        }

        try {
            const customerRef = ref(dbRef.current, `customers/${musteri_kodu}`);
            await set(customerRef, {
                ...editModal.customer,
                ad: newName,
                limit: Number(newLimit)
            });
            showModal('Başarılı', `'${newName}' adlı müşterinin bilgileri güncellendi.`);
            closeEditModal();
        } catch (error) {
            console.error("Müşteri güncelleme hatası:", error);
            showModal('Hata', 'Müşteri güncellenirken bir sorun oluştu.');
        }
    };

    const handleCustomerPanelSearch = async (e) => {
        e.preventDefault();
        
        if (customerPanelCode === ADMIN_CODE) {
            if (!user) {
                setShowAdminLogin(true);
            } else {
                setViewMode('admin');
            }
            return;
        }

        if (!customerPanelCode) {
            showModal('Hata', 'Lütfen bir müşteri kodu girin.');
            return;
        }

        try {
            const customerRef = ref(dbRef.current, `customers/${customerPanelCode}`);
            const snapshot = await get(customerRef);
            if (snapshot.exists()) {
                const customerData = snapshot.val();
                setCustomerPanelData(customerData);
                setShowAdminLogin(false);
            } else {
                setCustomerPanelData(null);
                setShowAdminLogin(false);
                showModal('Hata', `Kodu '${customerPanelCode}' olan müşteri bulunamadı.`);
            }
        } catch (error) {
            console.error("Müşteri arama hatası:", error);
            setCustomerPanelData(null);
            setShowAdminLogin(false);
            showModal('Hata', 'Müşteri aranırken bir sorun oluştu.');
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-700">Yükleniyor...</p>
            </div>
        );
    }
    
    const showAdminPanel = isAdmin && user;
    if (showAdminPanel && viewMode === 'customer') {
        setViewMode('admin');
    }

    const renderContent = () => {
        if (viewMode === 'admin' && isAdmin) {
            return (
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Başlık ve Toplam Borç */}
                    <header className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
                        <h1 className="text-3xl font-bold text-indigo-600 mb-2">Yönetici Paneli</h1>
                        <p className="text-lg font-semibold text-gray-700">Toplam Borç: <span className="text-2xl text-red-600">{totalDebt.toFixed(2)}</span> TL</p>
                        <p className="text-sm text-gray-500 mt-2">Merhaba, {user.displayName}!</p>
                    </header>
    
                    {/* Yönetim Formları */}
                    <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Müşteri Ekle Formu */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Müşteri Ekle</h2>
                            <form onSubmit={handleAddCustomer} className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Müşteri Adı" 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Limit (varsayılan: 50)" 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    value={newCustomerLimit}
                                    onChange={(e) => setNewCustomerLimit(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors">Müşteri Ekle</button>
                            </form>
                        </div>
    
                        {/* Alışveriş/Borç Ekleme Formu */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Veresiye Alışveriş</h2>
                            <form onSubmit={handleAddDebt} className="space-y-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Müşteri Adı" 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                        value={searchCustomer}
                                        onChange={(e) => {
                                            setSearchCustomer(e.target.value);
                                            setDebtCustomerCode('');
                                        }}
                                        ref={searchRef}
                                    />
                                    {filteredCustomers.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                            {filteredCustomers.map(customer => (
                                                <li
                                                    key={customer.musteri_kodu}
                                                    className="p-3 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSelectCustomer(customer)}
                                                >
                                                    {customer.ad} <span className="text-gray-500">({customer.musteri_kodu})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Müşteri Kodu"
                                    readOnly
                                    required
                                    value={debtCustomerCode}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="Miktar (TL)" 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    value={debtAmount}
                                    onChange={(e) => setDebtAmount(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors">Borç Ekle</button>
                            </form>
                        </div>
    
                        {/* Ödeme Yapma Formu */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Ödeme Yap</h2>
                            <form onSubmit={handleMakePayment} className="space-y-4">
                                <input 
                                    type="number" 
                                    placeholder="Müşteri Kodu" 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    value={paymentCustomerCode}
                                    onChange={(e) => setPaymentCustomerCode(e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="Miktar (TL)" 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors">Ödeme Yap</button>
                            </form>
                        </div>
    
                        {/* Faiz Uygulama Butonu */}
                        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
                            <h2 className="text-xl font-bold mb-4">Faiz Uygulama</h2>
                            <p className="text-sm text-gray-500 text-center mb-4">Bu işlem, ayın 21'ini geçmiş tüm borçlara %5 faiz ekler ve borç ödenene kadar her ay tekrarlanır.</p>
                            <button onClick={handleApplyInterest} className="w-full bg-rose-600 text-white font-semibold py-3 rounded-lg hover:bg-rose-700 transition-colors">Faizleri Uygula</button>
                        </div>
                    </main>
    
                    {/* Müşteri Listesi */}
                    <section className="mt-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold mb-2 sm:mb-0">Tüm Müşteriler</h2>
                            <input
                                type="text"
                                placeholder="Müşteri ara..."
                                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                value={searchListQuery}
                                onChange={(e) => setSearchListQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-4">
                            {filteredCustomerList.length > 0 ? (
                                filteredCustomerList.map(customer => (
                                    <div key={customer.musteri_kodu} className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                                        <div className="flex-1">
                                            <p className="font-bold text-lg">{customer.ad}</p>
                                            <p className="text-sm text-gray-500">Kodu: <span className="font-mono text-gray-700">{customer.musteri_kodu}</span></p>
                                            <p className="text-gray-600">Borç: <span className="font-semibold">{customer.borc.toFixed(2)}</span> TL</p>
                                            <p className="text-sm text-gray-500">Limit: {customer.limit} TL</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                ${customer.durum === 'zamanında' ? 'bg-green-100 text-green-700' : ''}
                                                ${customer.durum === 'gecikmiş' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                ${customer.durum === 'kronik' ? 'bg-red-100 text-red-700' : ''}
                                            `}>{customer.durum}</span>
                                            <p className="text-sm text-gray-500">Son Ödeme: {new Date(customer.son_odeme_tarihi).toLocaleDateString('tr-TR')}</p>
                                            <button 
                                                onClick={() => showEditModal(customer)} 
                                                className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors"
                                                title="Müşteriyi Düzenle"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.75" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => showConfirmModal(customer)} 
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                title="Müşteriyi Sil"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.36L16.2 2.365a.5.5 0 0 0-.39-.137H8.625a.5.5 0 0 0-.39.137L4.47 5.645A.5.5 0 0 0 4.1 6.25v1.25A1.5 1.5 0 0 0 5.5 9h13a1.5 1.5 0 0 0 1.4-1.5V6.25a.5.5 0 0 0-.372-.605Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">Müşteri bulunamadı.</p>
                            )}
                        </div>
                    </section>
                </div>
            );
        } else {
            return (
                <div className="p-4 sm:p-6 lg:p-8">
                    <header className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
                        <h1 className="text-3xl font-bold text-green-600 mb-2">Müşteri Paneli</h1>
                        <p className="text-lg text-gray-700">Borcunuzu görüntülemek için müşteri kodunuzu girin.</p>
                    </header>

                    <main className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
                        <form onSubmit={handleCustomerPanelSearch} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Müşteri Kodu"
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                value={customerPanelCode}
                                onChange={(e) => setCustomerPanelCode(e.target.value)}
                            />
                            <button type="submit" className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">Borcumu Sorgula</button>
                        </form>
                        {showAdminLogin && (
                           <div className="mt-6 text-center">
                             <p className="text-gray-600 mb-4">Bu kod, yönetici girişine aittir. Devam etmek için Google ile giriş yapın.</p>
                             <button
                                 onClick={handleGoogleSignIn}
                                 className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full"
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.5 12.001c0-.783-.069-1.554-.207-2.308h-10.463v4.36h5.922c-.244 1.48-1.018 2.766-2.296 3.626v2.812h3.633c2.133-1.954 3.354-4.836 3.354-8.49zM12.001 24c-3.242 0-6.103-1.748-7.666-4.347l3.238-2.508c1.013.784 2.302 1.256 3.67 1.256 2.894 0 5.234-2.34 5.234-5.234s-2.34-5.234-5.234-5.234c-1.368 0-2.657.472-3.67 1.256l-3.238-2.508c1.563-2.599 4.424-4.347 7.666-4.347c6.626 0 12 5.374 12 12s-5.374 12-12 12z" />
                                 </svg>
                                 <span>Google ile Giriş Yap</span>
                             </button>
                           </div>
                        )}
                    </main>

                    {customerPanelData && (
                        <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto space-y-2">
                            <h2 className="text-xl font-bold text-green-700">{customerPanelData.ad}</h2>
                            <p className="text-gray-600">Borç: <span className="font-semibold text-red-600">{customerPanelData.borc.toFixed(2)}</span> TL</p>
                            <p className="text-gray-600">Limit: {customerPanelData.limit} TL</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                ${customerPanelData.durum === 'zamanında' ? 'bg-green-100 text-green-700' : ''}
                                ${customerPanelData.durum === 'gecikmiş' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${customerPanelData.durum === 'kronik' ? 'bg-red-100 text-red-700' : ''}
                            `}>{customerPanelData.durum}</span>
                        </div>
                    )}
                </div>
            );
        }
    };
    
    return (
        <div className="bg-gray-50 font-sans text-gray-800 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="p-4 sm:p-6 lg:p-8 flex justify-center space-x-4">
                    <button
                        onClick={() => setViewMode('admin')}
                        className={`py-2 px-4 rounded-lg font-semibold transition-colors ${viewMode === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        Yönetici Paneli
                    </button>
                    <button
                        onClick={() => setViewMode('customer')}
                        className={`py-2 px-4 rounded-lg font-semibold transition-colors ${viewMode === 'customer' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        Müşteri Paneli
                    </button>
                </div>
                {renderContent()}
            </div>

            {/* Mesaj Modalı */}
            {modal.isVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm text-center">
                        <h3 className="text-lg font-bold mb-2">{modal.title}</h3>
                        <p className="text-gray-700 mb-4">{modal.message}</p>
                        <button onClick={closeModal} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors">Tamam</button>
                    </div>
                </div>
            )}
            
            {/* Onay Modalı */}
            {confirmModal.isVisible && confirmModal.customerToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm text-center">
                        <h3 className="text-lg font-bold mb-2 text-red-600">Müşteriyi Sil</h3>
                        <p className="text-gray-700 mb-4">
                            <b>{confirmModal.customerToDelete.ad}</b> adlı müşteriyi ve tüm borçlarını kalıcı olarak silmek istediğinden emin misin? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={closeConfirmModal} className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">İptal</button>
                            <button onClick={handleDeleteCustomer} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Düzenleme Modalı */}
            {editModal.isVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Müşteri Bilgilerini Düzenle</h3>
                        <form onSubmit={handleUpdateCustomer} className="space-y-4">
                            <label className="block">
                                <span className="text-gray-700">Müşteri Adı:</span>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={editModal.newName}
                                    onChange={(e) => setEditModal({ ...editModal, newName: e.target.value })}
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-700">Limit (TL):</span>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={editModal.newLimit}
                                    onChange={(e) => setEditModal({ ...editModal, newLimit: e.target.value })}
                                />
                            </label>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;