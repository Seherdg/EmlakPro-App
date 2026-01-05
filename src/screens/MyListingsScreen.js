import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // Gerçek bağlantılar

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8', danger: '#EF4444', success: '#10B981' };

export default function MyListingsScreen({ navigation }) {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // SADECE BENİM İLANLARIMI GETİR
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Sorgu: 'listings' tablosunda 'ownerId'si benim ID'm olanları bul
    const q = query(collection(db, "listings"), where("ownerId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyListings(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // SİLME FONKSİYONU
  const handleDelete = (id) => {
    Alert.alert("İlanı Sil", "Bu işlem geri alınamaz.", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Sil", 
        style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, "listings", id)); // Firebase'den siler
        }
      }
    ]);
  };

  // DÜZENLEME FONKSİYONU (Fiyat veya Durum Güncelleme)
  const handleEdit = (item) => {
    Alert.alert("İlanı Düzenle", "Seçenekler:", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: item.status === 'Yayında' ? "Pasife Al" : "Yayına Al", 
        onPress: async () => {
          const newStatus = item.status === 'Yayında' ? 'Pasif' : 'Yayında';
          await updateDoc(doc(db, "listings", item.id), { status: newStatus });
        }
      },
      // Basit Fiyat Güncelleme (Demo için sabit artış veya prompt eklenebilir. 
      // React Native core Alert.prompt desteklemez, o yüzden basit yapıyoruz)
      { 
        text: "Fiyatı Güncelle (+10%)", 
        onPress: async () => {
          const newPrice = Math.floor(item.price * 1.1); // %10 artırır
          await updateDoc(doc(db, "listings", item.id), { price: newPrice });
          Alert.alert("Güncellendi", "Yeni fiyat: " + newPrice);
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.info}>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.badge, {backgroundColor: item.status === 'Yayında' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}]}>
            <Text style={{color: item.status === 'Yayında' ? COLORS.success : COLORS.danger, fontSize: 10, fontWeight:'bold'}}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.price}>
           {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumSignificantDigits: 3 }).format(item.price)}
        </Text>
        
        <View style={styles.statsRow}>
          <Text style={{color: COLORS.textGray, fontSize:12}}>Düzenle veya Sil</Text>
          <View style={{flexDirection:'row', gap: 10}}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
              <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: COLORS.danger}]} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{marginTop: 50}} />
      ) : myListings.length === 0 ? (
        <View style={styles.emptyContainer}>
           <Ionicons name="documents-outline" size={60} color={COLORS.textGray} />
           <Text style={styles.emptyText}>Henüz ilan eklemediniz.</Text>
           <TouchableOpacity onPress={() => navigation.navigate('AddTab')} style={{marginTop:10}}>
             <Text style={{color: COLORS.accent, fontWeight:'bold'}}>Hemen Ekle</Text>
           </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={myListings} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={{padding: 20}} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: { flexDirection: 'row', backgroundColor: COLORS.cardBg, marginBottom: 15, borderRadius: 15, overflow: 'hidden', height: 110, padding: 10, borderWidth:1, borderColor:'#334155' },
  image: { width: 90, height: 90, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  title: { color: 'white', fontWeight: 'bold', fontSize: 16, maxWidth: 120 },
  price: { color: COLORS.accent, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  actionBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textGray, marginTop: 10, fontSize: 16 }
});