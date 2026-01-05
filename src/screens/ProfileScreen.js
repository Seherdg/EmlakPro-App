// Dosya: src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../context/UserContext';

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8', danger: '#EF4444', success: '#10B981' };

export default function ProfileScreen({ navigation }) {
  const { user, logout, upgradeToPremium, favorites, myListings } = useContext(UserContext);

  const handleNotifications = () => {
    // BURAYA KORUMA EKLEDİK (user.notifications varsa işlem yap)
    if (user.notifications && user.notifications.length > 0) {
      Alert.alert("Bildirimler", "📌 " + user.notifications.join('\n\n📌 '));
    } else {
      Alert.alert("Bildirimler", "📭 Yeni bildiriminiz yok.");
    }
  };

  const handleUpgrade = () => {
    Alert.alert("Tebrikler!", "Hesabınız Premium'a yükseltildi.", [{ text: "Harika", onPress: upgradeToPremium }]);
  };

 // --- GÜNCELLENMİŞ ÇIKIŞ BUTONU AKSİYONU ---
  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { 
        text: "Çıkış", 
        style: "destructive", 
        // BURAYA 'async' EKLENDİ
        onPress: async () => { 
          // BURAYA 'await' EKLENDİ (İşlemin bitmesini bekle)
          await logout(); 
          
          // İşlem bitince Giriş Ekranına at
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  // Güvenli veri erişimi için yardımcılar
  const notificationCount = user.notifications ? user.notifications.length : 0;
  const listingCount = myListings ? myListings.length : 0;
  const favoriteCount = favorites ? favorites.length : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.header}>
        <View style={styles.profileInfo}>
          <Image source={{ uri: user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
          <View style={{flex:1}}>
            <Text style={styles.name}>{user.name || 'Misafir'}</Text>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={[styles.role, {color: user.role && user.role.includes('Premium') ? COLORS.accent : COLORS.textGray}]}>
                {user.role || 'Ziyaretçi'}
              </Text>
              {user.role && user.role.includes('Premium') && <Ionicons name="star" size={14} color={COLORS.accent} style={{marginLeft:5}} />}
            </View>
            
            {user.role && !user.role.includes('Premium') && (
              <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
                <Text style={styles.upgradeText}>Premium'a Geç</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('MyListings')}>
            <Text style={styles.statNumber}>{listingCount}</Text>
            <Text style={styles.statLabel}>İlanlar</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.statBox}>
            <Text style={styles.statNumber}>1.4k</Text>
            <Text style={styles.statLabel}>Görüntülenme</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('FavoritesTab')}>
            <Text style={styles.statNumber}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <MenuItem icon="home-outline" title="İlanlarım" onPress={() => navigation.navigate('MyListings')} />
        <MenuItem icon="heart-outline" title="Favorilerim" onPress={() => navigation.navigate('FavoritesTab')} />
        
        {/* HATA BURADAYDI, DÜZELTİLDİ: notificationCount kullanıldı */}
        <MenuItem icon="notifications-outline" title="Bildirimler" badge={notificationCount > 0 ? notificationCount : null} onPress={handleNotifications} />
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const MenuItem = ({ icon, title, badge, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={{flexDirection:'row', alignItems:'center'}}><Ionicons name={icon} size={22} color={COLORS.accent} style={{marginRight:15}} /><Text style={styles.menuText}>{title}</Text></View>
    {badge ? <View style={styles.menuBadge}><Text style={{color:'white', fontSize:10}}>{badge}</Text></View> : <Ionicons name="chevron-forward" size={20} color={COLORS.textGray} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 10 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 15, borderWidth: 3, borderColor: COLORS.accent, backgroundColor: '#fff' },
  name: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  role: { fontSize: 14, fontWeight:'bold' },
  upgradeBtn: { backgroundColor: COLORS.success, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 5 },
  upgradeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15 },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: COLORS.textGray, fontSize: 12 },
  divider: { width: 1, backgroundColor: '#334155' },
  menuContainer: { padding: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cardBg, padding: 15, borderRadius: 15, marginBottom: 15 },
  menuText: { color: 'white', fontSize: 16 },
  menuBadge: { backgroundColor: '#EF4444', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 15, borderWidth: 1, borderColor: COLORS.danger, borderRadius: 15 },
  logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});