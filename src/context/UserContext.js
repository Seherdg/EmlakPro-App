import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [myListings, setMyListings] = useState([]); 
  
  const [user, setUser] = useState({
    name: '', role: '', gender: '', avatar: '',
    notifications: [], isLoggedIn: false, uid: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({ ...data, notifications: data.notifications || [], isLoggedIn: true, uid: currentUser.uid });
        }
      } else {
        setUser({ isLoggedIn: false });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- GÜNCELLENEN GİRİŞ/KAYIT FONKSİYONU ---
  const loginOrRegister = async (email, password, name, gender, accountType, mode) => {
    try {
      if (mode === 'login') {
        // GİRİŞ YAP
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // KAYIT OL
        const newUser = await createUserWithEmailAndPassword(auth, email, password);
        const uid = newUser.user.uid;

        let avatarUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        if (gender === 'Kadın') avatarUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png';
        if (accountType === 'agent') {
           avatarUrl = gender === 'Kadın' 
             ? 'https://cdn-icons-png.flaticon.com/512/4439/4439948.png' 
             : 'https://cdn-icons-png.flaticon.com/512/4439/4439944.png';
        }

        const roleName = accountType === 'agent' ? 'Emlak Danışmanı 👔' : 'Bireysel Üye 🏠';

        const userData = {
          name: name, email: email, role: roleName, accountType: accountType,
          gender: gender, avatar: avatarUrl, notifications: ["🎉 EmlakPro'ya Hoşgeldiniz!"],
        };

        await setDoc(doc(db, "users", uid), userData);
        setUser({ ...userData, isLoggedIn: true, uid: uid });
      }
    } catch (error) {
      // BURADA ALERT VERMİYORUZ, HATAYI FIRLATIYORUZ Kİ EKRAN YAKALASIN
      throw error; 
    }
  };

  // --- GÜNCELLENMİŞ LOGOUT FONKSİYONU ---
  const logout = async () => {
    // 1. ÖNCE: Uygulama hafızasındaki kullanıcıyı sil (Anında etki eder)
    setUser({ 
      name: '', role: '', gender: '', avatar: '',
      notifications: [], isLoggedIn: false, uid: null 
    });
    setFavorites([]); // Favorileri temizle
    
    // 2. SONRA: Firebase sunucusundan çıkış yap (Arka planda çalışsın)
    await signOut(auth);
  };
  const upgradeToPremium = async () => {
    if (user.uid) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { isPremium: true });
      alert("Premium özellikler açıldı!");
    }
  };

  const toggleFavorite = (item) => {
    const exists = favorites.find(fav => fav.id === item.id);
    if (exists) setFavorites(favorites.filter(fav => fav.id !== item.id));
    else setFavorites([...favorites, item]);
  };
  const deleteMyListing = (id) => setMyListings(prev => prev.filter(item => item.id !== id));
  const updateMyListingStatus = (id, newStatus) => setMyListings(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));

  return (
    <UserContext.Provider value={{ user, login: loginOrRegister, logout, upgradeToPremium, favorites, toggleFavorite, myListings, deleteMyListing, updateMyListingStatus }}>
      {children}
    </UserContext.Provider>
  );
};