import React, { useContext } from 'react'; // useState yerine useContext
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { UserContext } from '../context/UserContext'; // Context Eklendi

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8', danger: '#EF4444' };

export default function FavoritesScreen({ navigation }) {
  // Veriyi Context'ten çekiyoruz
  const { favorites, toggleFavorite } = useContext(UserContext);

  const handleRemove = (item) => {
    Alert.alert("Kaldır", "Favorilerden silinsin mi?", [
      { text: "Hayır", style: "cancel" },
      { text: "Evet", style: "destructive", onPress: () => toggleFavorite(item) } // Context fonksiyonunu kullan
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Detail', { item })} 
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        
        {/* Çöp Kutusu */}
        <TouchableOpacity style={styles.trashBtn} onPress={() => handleRemove(item)}>
          <Ionicons name="trash-outline" size={18} color="white" />
        </TouchableOpacity>

        <BlurView intensity={20} tint="dark" style={styles.priceTag}>
          <Text style={styles.priceText}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumSignificantDigits: 3 }).format(item.price)}
          </Text>
        </BlurView>
      </View>

      <View style={styles.infoContainer}>
        <View style={{flex: 1}}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.location}>📍 {item.location}</Text>
        </View>
        
        {/* Kalp Butonu (Bu da siler) */}
        <TouchableOpacity onPress={() => handleRemove(item)}>
          <Ionicons name="heart" size={28} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorilerim</Text>
        <Text style={styles.headerCount}>{favorites.length} İlan</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={60} color={COLORS.textGray} />
          <Text style={styles.emptyText}>Henüz favori eklemediniz.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HomeTab')} style={{marginTop:20}}>
            <Text style={{color: COLORS.accent, fontWeight:'bold'}}>İlanlara Git</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: COLORS.cardBg, paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
  headerCount: { color: COLORS.accent, fontSize: 14, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  imageContainer: { height: 180, width: '100%' },
  image: { width: '100%', height: '100%' },
  trashBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(239, 68, 68, 0.9)', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  priceTag: { position: 'absolute', bottom: 15, left: 15, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.4)' },
  priceText: { color: COLORS.accent, fontWeight: 'bold', fontSize: 16 },
  infoContainer: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  location: { color: COLORS.textGray, fontSize: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.textGray, marginTop: 10, fontSize: 16 }
});