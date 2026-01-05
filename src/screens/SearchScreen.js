// Dosya: src/screens/SearchScreen.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8' };
const { width } = Dimensions.get('window');

export default function SearchScreen({ navigation }) {
  
  // Kategoriye Gitme Fonksiyonu
  const handleCategoryPress = (categoryName) => {
    // Ana Menüdeki (Main) HomeTab'a git, oradan da HomeScreen'e parametre gönder
    navigation.navigate('HomeTab', { 
      screen: 'HomeScreen', 
      params: { selectedCategory: categoryName } // Bu parametreyi Home yakalayacak
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keşfet</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textGray} />
          <TextInput placeholder="Ara..." placeholderTextColor={COLORS.textGray} style={styles.searchInput} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Kategoriler (Kutular) - ARTIK TIKLANABİLİR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategorilere Göz At</Text>
          <View style={styles.gridContainer}>
            <CategoryBox icon="business" title="Plaza" count="124" color="#3B82F6" onPress={() => handleCategoryPress('Plaza')} />
            <CategoryBox icon="home" title="Villa" count="56" color="#10B981" onPress={() => handleCategoryPress('Villa')} />
            <CategoryBox icon="bed" title="Daire" count="890" color="#F59E0B" onPress={() => handleCategoryPress('Daire')} />
            <CategoryBox icon="sunny" title="Yazlık" count="45" color="#8B5CF6" onPress={() => handleCategoryPress('Yazlık')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const CategoryBox = ({ icon, title, count, color, onPress }) => (
  <TouchableOpacity style={styles.catBox} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.catTitle}>{title}</Text>
    <Text style={styles.catCount}>{count} İlan</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.cardBg, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchBar: { flexDirection: 'row', backgroundColor: '#0F172A', padding: 12, borderRadius: 12, alignItems: 'center' },
  searchInput: { flex: 1, color: COLORS.text, marginLeft: 10 },
  section: { padding: 20 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  catBox: { width: (width - 55) / 2, backgroundColor: COLORS.cardBg, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  catTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
  catCount: { color: COLORS.textGray, fontSize: 12, marginTop: 2 },
});