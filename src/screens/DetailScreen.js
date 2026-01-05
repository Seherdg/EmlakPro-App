import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// FIREBASE GÜNCELLEME KOMUTLARI EKLENDİ
import { doc, updateDoc, increment } from 'firebase/firestore'; 
import { db } from '../firebaseConfig'; 

const { width } = Dimensions.get('window');
const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8', green: '#10B981' };

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;
  
  // --- GÖRÜNTÜLENME SAYISINI ARTIR ---
  useEffect(() => {
    const increaseViewCount = async () => {
      try {
        // İlanın ID'sine göre 'views' alanını 1 artırır (Atomik işlem)
        const listingRef = doc(db, "listings", item.id);
        await updateDoc(listingRef, {
          views: increment(1)
        });
      } catch (error) {
        console.log("Sayaç hatası:", error);
      }
    };

    increaseViewCount();
  }, []); // Sadece sayfa ilk açıldığında çalışır
  // ------------------------------------

  const handleChat = () => {
    if (item.ownerId) {
      navigation.navigate('Chat', { receiverId: item.ownerId, receiverName: 'İlan Sahibi' });
    } else {
      Alert.alert("Bilgi", "Bu ilanın sahibi sistemde kayıtlı değil (Demo İlan).");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'Konut'}</Text>
          </View>
          
          {/* Görüntülenme Göstergesi (Opsiyonel olarak resmin üstüne koydum) */}
          <View style={styles.viewBadge}>
            <Ionicons name="eye" size={14} color="white" />
            <Text style={{color:'white', fontSize:12, marginLeft:5, fontWeight:'bold'}}>
               {item.views ? item.views + 1 : 1} 
            </Text>
          </View>

        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={18} color={COLORS.accent} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <View style={styles.featuresRow}>
            <FeatureBox icon="bed-outline" val={item.room_count} label="Oda" />
            <FeatureBox icon="water-outline" val={item.baths || '1'} label="Banyo" />
            <FeatureBox icon="resize-outline" val={`${item.size_m2} m²`} label="Alan" />
          </View>

          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{item.description || "Açıklama girilmemiştir."}</Text>

          <View style={styles.agentCard}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.agentImage} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.agentTitle}>İlan Sahibi</Text>
              <Text style={styles.agentName}>{item.ownerId ? 'Onaylı Satıcı' : 'Demo Hesap'}</Text>
            </View>
            <View style={{flexDirection:'row', gap: 10}}>
              <TouchableOpacity style={styles.iconButtonGreen} onPress={handleChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonOrange} onPress={() => Linking.openURL('tel:+905551234567')}>
                <Ionicons name="call-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Fiyat</Text>
          <Text style={styles.priceValue}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumSignificantDigits: 3 }).format(item.price)}
          </Text>
        </View>
        <TouchableOpacity style={styles.rentButton} onPress={handleChat}>
          <Text style={styles.rentButtonText}>İlan Sahibiyle Görüş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FeatureBox = ({ icon, val, label }) => (
  <View style={styles.featureBox}>
    <Ionicons name={icon} size={24} color={COLORS.accent} />
    <Text style={styles.featureValue}>{val}</Text>
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageContainer: { width: '100%', height: 350, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  categoryBadge: { position: 'absolute', top: 50, right: 20, backgroundColor: COLORS.accent, paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20 },
  categoryText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  viewBadge: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, flexDirection:'row', alignItems:'center' },
  contentContainer: { padding: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  locationText: { color: COLORS.textGray, marginLeft: 5, fontSize: 14 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  featureBox: { width: width * 0.27, height: 90, backgroundColor: COLORS.cardBg, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  featureValue: { color: COLORS.text, fontWeight: 'bold', fontSize: 16, marginTop: 5 },
  featureLabel: { color: COLORS.textGray, fontSize: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { color: COLORS.textGray, lineHeight: 22, fontSize: 14, marginBottom: 30 },
  agentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  agentImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white' },
  agentTitle: { color: COLORS.textGray, fontSize: 12 },
  agentName: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  iconButtonGreen: { width: 40, height: 40, backgroundColor: COLORS.green, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  iconButtonOrange: { width: 40, height: 40, backgroundColor: COLORS.accent, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', height: 90, backgroundColor: COLORS.cardBg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 10, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderTopWidth: 1, borderTopColor: '#334155' },
  priceLabel: { color: COLORS.textGray, fontSize: 12 },
  priceValue: { color: COLORS.accent, fontSize: 20, fontWeight: 'bold' },
  rentButton: { backgroundColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20 },
  rentButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});