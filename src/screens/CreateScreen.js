import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore'; 
import { db, auth } from '../firebaseConfig'; // auth eklendi

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8' };
const CATEGORIES = ['Daire', 'Villa', 'Plaza', 'Yazlık'];

export default function CreateScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Daire');
  const [roomCount, setRoomCount] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg');

  const handleCreate = async () => {
    if (!title || !price || !location) {
      Alert.alert("Eksik Bilgi", "Lütfen zorunlu alanları doldurunuz.");
      return;
    }

    // KULLANICI GİRİŞ YAPMIŞ MI KONTROL ET
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Hata", "İlan eklemek için giriş yapmalısınız.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "listings"), {
        title: title,
        price: Number(price),
        location: location,
        category: category,
        room_count: roomCount || 'Belirtilmedi',
        size_m2: Number(size) || 0,
        description: description,
        image_url: imageUrl,
        createdAt: new Date(),
        status: 'Yayında',
        ownerId: currentUser.uid // <--- İŞTE BU SATIR KİMLİĞİ KAYDEDİYOR
      });

      setLoading(false);
      Alert.alert("Başarılı!", "İlanınız yayına alındı.", [
        { text: "Tamam", onPress: () => navigation.navigate('MyListings') } // Direkt İlanlarıma gitsin
      ]);
      
      // Formu temizle
      setTitle(''); setPrice(''); setLocation('');

    } catch (error) {
      setLoading(false);
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Yeni İlan Oluştur</Text></View>
      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>İlan Başlığı</Text>
        <TextInput style={styles.input} placeholder="Örn: Kadıköy'de Deniz Manzaralı" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />
        <View style={styles.row}>
          <View style={{flex:1, marginRight:10}}>
            <Text style={styles.label}>Fiyat (TL)</Text>
            <TextInput style={styles.input} placeholder="8500000" keyboardType="numeric" placeholderTextColor="#64748B" value={price} onChangeText={setPrice} />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.label}>Büyüklük (m²)</Text>
            <TextInput style={styles.input} placeholder="120" keyboardType="numeric" placeholderTextColor="#64748B" value={size} onChangeText={setSize} />
          </View>
        </View>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.catBtn, category === cat && styles.catBtnActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.catText, category === cat && {color:'white'}]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          <View style={{flex:1, marginRight:10}}>
            <Text style={styles.label}>Konum</Text>
            <TextInput style={styles.input} placeholder="Beşiktaş, İstanbul" placeholderTextColor="#64748B" value={location} onChangeText={setLocation} />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.label}>Oda Sayısı</Text>
            <TextInput style={styles.input} placeholder="3+1" placeholderTextColor="#64748B" value={roomCount} onChangeText={setRoomCount} />
          </View>
        </View>
        <Text style={styles.label}>Resim URL</Text>
        <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#64748B" value={imageUrl} onChangeText={setImageUrl} />
        <Text style={styles.label}>Açıklama</Text>
        <TextInput style={[styles.input, {height: 80}]} multiline placeholder="Detaylar..." placeholderTextColor="#64748B" value={description} onChangeText={setDescription} />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>İlanı Yayınla</Text>}
        </TouchableOpacity>
        <View style={{height: 100}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.cardBg, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { color: 'white', marginBottom: 8, marginLeft: 5, fontWeight: 'bold', fontSize: 14 },
  input: { backgroundColor: COLORS.cardBg, color: 'white', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row' },
  catRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  catBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: '#334155' },
  catBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.textGray, fontWeight: 'bold' },
  saveButton: { backgroundColor: COLORS.accent, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});