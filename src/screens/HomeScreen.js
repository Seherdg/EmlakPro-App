import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, StatusBar, Alert } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BlurView } from 'expo-blur'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { Ionicons } from '@expo/vector-icons'; 
import { UserContext } from '../context/UserContext'; 

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8', danger: '#EF4444' };

export default function HomeScreen({ navigation, route }) {
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [userLocation, setUserLocation] = useState(''); 
  
  // 1. ARAMA METNİ İÇİN STATE EKLEDİK
  const [searchText, setSearchText] = useState('');

  // Kategori dışarıdan (Keşfet'ten) gelirse
  useEffect(() => {
    if (route.params?.selectedCategory) {
      setSelectedCategory(route.params.selectedCategory);
      navigation.setParams({ selectedCategory: null });
    }
  }, [route.params]);

  // Verileri Çek
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'listings'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(list);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. GELİŞMİŞ FİLTRELEME MANTIĞI ---
  const filteredListings = listings.filter(item => {
    // A. Kategori Kontrolü
    const matchesCategory = selectedCategory === 'Tümü' || (item.category && item.category.trim() === selectedCategory);

    // B. Arama Metni Kontrolü (Başlıkta VEYA Konumda ara)
    const text = searchText.toLowerCase();
    const matchesSearch = 
      (item.title && item.title.toLowerCase().includes(text)) || 
      (item.location && item.location.toLowerCase().includes(text));

    // Her iki şart da sağlanmalı
    return matchesCategory && matchesSearch;
  });
  // ---------------------------------------

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={{flex:1}}>
          <Text style={styles.greeting}>Konum</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-sharp" size={18} color={COLORS.accent} style={{ marginRight: 5 }} />
            <TextInput 
              style={styles.locationInput}
              value={userLocation}
              onChangeText={setUserLocation} 
              placeholder="Konum Ekle" 
              placeholderTextColor={COLORS.textGray}
            />
            <Ionicons name="pencil" size={12} color={COLORS.textGray} style={{ marginLeft: 8 }} />
          </View>
        </View>
        <TouchableOpacity style={styles.aiButtonSmall} onPress={() => navigation.navigate('AddListing')}>
          <LinearGradient colors={['#FF6F00', '#F59E0B']} style={styles.aiGradientSmall}><Ionicons name="sparkles" size={20} color="white" /></LinearGradient>
        </TouchableOpacity>
      </View>

      {/* --- 3. ARAMA ÇUBUĞUNU BAĞLADIK --- */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textGray} style={{ marginRight: 10 }} />
        <TextInput 
          placeholder="Semt veya konut tipi ara..." 
          placeholderTextColor={COLORS.textGray} 
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText} // Yazdıkça state güncellenir
        />
        {/* Yazı varsa temizleme (X) butonu çıksın */}
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.categoryRow}>
        {['Tümü', 'Daire', 'Plaza', 'Villa', 'Yazlık'].map((cat, index) => (
          <TouchableOpacity key={index} style={[styles.catButton, selectedCategory === cat && styles.catButtonActive]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Vitrin ({filteredListings.length})</Text>

      <FlatList
        data={filteredListings}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ListingCard item={item} navigation={navigation} />}
        
        // --- 4. BOŞ DURUM MESAJI ---
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={COLORS.textGray} />
            <Text style={styles.emptyText}>
              {searchText 
                ? `"${searchText}" için sonuç bulunamadı.` 
                : "Bu kategoride henüz ilan yok."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// KART BİLEŞENİ (AYNI KALDI)
const ListingCard = ({ item, navigation }) => {
  const { favorites, toggleFavorite } = useContext(UserContext);
  const isLiked = favorites.some(fav => fav.id === item.id);

  const handleFavorite = () => {
    toggleFavorite(item);
    if (!isLiked) Alert.alert("Eklendi", "İlan favorilerinize eklendi ❤️");
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('Detail', { item })}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url || 'https://via.placeholder.com/400' }} style={styles.image} />
        <TouchableOpacity style={styles.favButton} onPress={handleFavorite}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? COLORS.danger : "white"} />
        </TouchableOpacity>
        <BlurView intensity={30} tint="dark" style={styles.priceTag}>
          <Text style={styles.priceText}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumSignificantDigits: 3 }).format(item.price)}</Text>
        </BlurView>
        <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category || 'Konut'}</Text></View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: COLORS.textGray, fontSize: 12 },
  locationInput: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', minWidth: 150, padding: 0 },
  aiButtonSmall: { borderRadius: 12, overflow: 'hidden' },
  aiGradientSmall: { width: 40, height: 40, justifyContent:'center', alignItems:'center' },
  searchBar: { flexDirection: 'row', backgroundColor: COLORS.cardBg, padding: 12, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  searchInput: { color: COLORS.text, flex: 1, fontSize:15 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  catButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: COLORS.cardBg, borderWidth:1, borderColor: '#334155' },
  catButtonActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.textGray, fontWeight: '600', fontSize:12 },
  catTextActive: { color: '#000', fontWeight: 'bold' },
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 24, marginBottom: 20, overflow: 'hidden' },
  imageContainer: { height: 200, width: '100%' },
  image: { width: '100%', height: '100%' },
  priceTag: { position: 'absolute', bottom: 15, left: 15, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)' },
  priceText: { color: COLORS.accent, fontWeight: 'bold', fontSize: 16 },
  categoryBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: COLORS.accent, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  categoryText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  infoContainer: { padding: 15 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  location: { color: COLORS.textGray, fontSize: 14 },
  favButton: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.4)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  
  // BOŞ DURUM STİLİ
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyText: { color: COLORS.textGray, marginTop: 15, fontSize: 16, textAlign: 'center' }
});