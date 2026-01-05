// Dosya: src/screens/AddListingScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Keyboard, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0F172A', // Koyu Lacivert Zemin
  cardBg: '#1E293B',     // Kutu Rengi
  accent: '#F59E0B',     // Turuncu
  text: '#FFFFFF',       // Beyaz
  textGray: '#94A3B8',   // Gri
  success: '#10B981',    // Yeşil
  danger: '#EF4444',     // Kırmızı
};

export default function AddListingScreen({ navigation }) {
  // --- STATE'LER ---
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Daire'); // Konut Tipi
  const [rooms, setRooms] = useState(2);     // Oda Sayısı (Varsayılan 2)
  const [baths, setBaths] = useState(1);     // Banyo Sayısı (Varsayılan 1)
  const [size, setSize] = useState('120');   // m2
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // İbre Animasyonu
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // --- ARTTIRMA / AZALTMA FONKSİYONLARI ---
  const increase = (setter, val) => setter(val + 1);
  const decrease = (setter, val) => { if (val > 0) setter(val - 1); };

  // --- HESAPLAMA MANTIĞI ---
  const calculatePrice = () => {
    Keyboard.dismiss();
    setLoading(true);
    setResult(null);
    rotateAnim.setValue(0);

    setTimeout(() => {
      // Basit Algoritma
      let basePrice = 2000000;
      const sizeVal = parseInt(size) || 0;
      
      basePrice += sizeVal * 35000;         // m2 etkisi
      basePrice += rooms * 400000;          // Oda etkisi
      basePrice += baths * 200000;          // Banyo etkisi (YENİ)
      
      if (type === 'Villa') basePrice *= 1.5; // Villa çarpanı
      if (location.toLowerCase().includes('istanbul')) basePrice *= 1.5;

      const randomFactor = Math.floor(Math.random() * 500000);
      const finalPrice = basePrice + randomFactor;

      // Durum Analizi
      let angle = 90; 
      let statusText = "Tam Değerinde";
      let statusColor = COLORS.accent;

      if (finalPrice < 6000000) { angle = 30; statusText = "Fırsat 📉"; statusColor = COLORS.success; } 
      else if (finalPrice > 20000000) { angle = 150; statusText = "Premium 📈"; statusColor = COLORS.danger; }

      setResult({
        price: finalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumSignificantDigits: 3 }),
        status: statusText,
        color: statusColor
      });

      setLoading(false);

      // İbre Animasyonu
      Animated.timing(rotateAnim, {
        toValue: angle,
        duration: 1500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();

    }, 1500);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Fiyat Tahmini</Text>
        <View style={{width: 30}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. KONUM GİRİŞİ */}
        <Text style={styles.label}>Konum</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={COLORS.accent} style={{marginRight:10}} />
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Kadıköy, İstanbul" 
            placeholderTextColor={COLORS.textGray}
            value={location} onChangeText={setLocation}
          />
        </View>

        {/* 2. KONUT TİPİ (Dropdown Görünümlü) */}
        <Text style={styles.label}>Konut Tipi</Text>
        <TouchableOpacity style={styles.dropdownBox} onPress={() => setType(type === 'Daire' ? 'Villa' : 'Daire')}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Ionicons name={type === 'Daire' ? "business-outline" : "home-outline"} size={20} color={COLORS.accent} style={{marginRight:10}} />
            <Text style={{color: COLORS.text, fontSize:16}}>{type}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.text} />
        </TouchableOpacity>

        {/* 3. ODA SAYISI (Stepper) */}
        <Text style={styles.label}>Oda Sayısı</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => decrease(setRooms, rooms)}>
            <Ionicons name="remove" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
          <Text style={styles.stepValue}>{rooms}</Text>
          <TouchableOpacity style={styles.stepBtnActive} onPress={() => increase(setRooms, rooms)}>
            <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* 4. BANYO SAYISI (Stepper) - YENİ */}
        <Text style={styles.label}>Banyo Sayısı</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => decrease(setBaths, baths)}>
            <Ionicons name="remove" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
          <Text style={styles.stepValue}>{baths}</Text>
          <TouchableOpacity style={styles.stepBtnActive} onPress={() => increase(setBaths, baths)}>
            <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* 5. ALAN (m2) */}
        <Text style={styles.label}>Alan (m²)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="scan-outline" size={20} color={COLORS.accent} style={{marginRight:10}} />
          <TextInput 
            style={styles.input} 
            placeholder="120" keyboardType="numeric"
            placeholderTextColor={COLORS.textGray}
            value={size} onChangeText={setSize}
          />
        </View>

        {/* HESAPLA BUTONU */}
        <TouchableOpacity onPress={calculatePrice} disabled={loading} style={{marginTop: 20}}>
          <LinearGradient
            colors={loading ? ['#334155', '#1E293B'] : ['#FF6F00', '#F59E0B']}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={styles.calcButton}
          >
            {loading ? (
              <Text style={styles.buttonText}>Hesaplanıyor...</Text>
            ) : (
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="sparkles" size={20} color="white" style={{marginRight:8}} />
                <Text style={styles.buttonText}>Fiyatı Hesapla</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* SONUÇ GÖSTERGESİ (Hesaplandıktan Sonra Çıkar) */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Tahmini Değer</Text>
            
            {/* GÖSTERGE */}
            <View style={styles.gaugeWrapper}>
              <View style={styles.gaugeBack}>
                 <LinearGradient colors={[COLORS.success, COLORS.accent, COLORS.danger]} start={{x:0,y:1}} end={{x:1,y:1}} style={styles.gaugeGradient} />
              </View>
              <Animated.View style={[styles.needle, { transform: [{ rotate: rotation }] }]} />
              <View style={styles.gaugeCenter} />
            </View>

            <Text style={styles.priceText}>{result.price}</Text>
            <View style={[styles.badge, { borderColor: result.color }]}>
              <Text style={[styles.badgeText, { color: result.color }]}>{result.status}</Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.cardBg },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50 },

  scrollContent: { padding: 20 },

  label: { color: COLORS.textGray, fontSize: 12, marginBottom: 8, marginTop: 15 },
  
  // Input Stilleri (Resimdeki gibi)
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 15, height: 55 },
  input: { flex: 1, color: COLORS.text, fontSize: 16 },

  // Dropdown Stili
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cardBg, borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 15, height: 55 },

  // Stepper (Sayaç) Stilleri
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cardBg, borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 5, height: 55 },
  stepBtn: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  stepBtnActive: { width: 45, height: 45, borderRadius: 10, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  stepValue: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },

  // Buton
  calcButton: { height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Sonuç Alanı
  resultContainer: { marginTop: 30, alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#334155' },
  resultLabel: { color: COLORS.textGray, fontSize: 14, marginBottom: 20 },
  gaugeWrapper: { width: 180, height: 90, overflow: 'hidden', alignItems: 'center', position: 'relative', marginBottom: 15 },
  gaugeBack: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#334155', position: 'absolute', top: 0 },
  gaugeGradient: { width: 180, height: 180, borderRadius: 90, opacity: 0.9 },
  needle: { width: 4, height: 80, backgroundColor: 'white', position: 'absolute', bottom: 0, left: 88, borderRadius: 2, transformOrigin: 'bottom center' },
  gaugeCenter: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.text, position: 'absolute', bottom: -10, zIndex: 10 },
  priceText: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  badge: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, marginTop: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  badgeText: { fontWeight: 'bold', fontSize: 14 },
});