import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8' };

export default function LoginScreen({ navigation }) {
  const { login, user } = useContext(UserContext);
  
  const [mode, setMode] = useState('login'); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState('Erkek');
  const [accountType, setAccountType] = useState('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.isLoggedIn) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  }, [user.isLoggedIn]);

  const handleAuth = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert("Eksik Bilgi", "Lütfen E-posta ve Şifrenizi giriniz.");
      return;
    }

    if (mode === 'register' && name.length === 0) {
      Alert.alert("Eksik Bilgi", "Kayıt olmak için isminizi girmelisiniz.");
      return;
    }

    setLoading(true);
    
    try {
      // Login fonksiyonunu çağırıyoruz
      await login(email, password, name, selectedGender, accountType, mode);
      // Başarılı olursa useEffect yönlendirir
    } catch (error) {
      // --- HATA YAKALAMA VE YÖNLENDİRME ---
      setLoading(false);
      console.log("Login hatası:", error.code);

      // Firebase 'Kullanıcı Bulunamadı' veya 'Hatalı Giriş' kodu
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        
        if (mode === 'login') {
          Alert.alert(
            "Kullanıcı Bulunamadı", 
            "Böyle bir hesap görünmüyor. Hemen kayıt olmak ister misiniz?",
            [
              { text: "Tekrar Dene", style: "cancel" },
              { 
                text: "Kayıt Ol", 
                onPress: () => {
                  setMode('register'); // Modu Kayıt'a çevir
                  // İstersen şifreyi temizleyebilirsin
                  setPassword(''); 
                } 
              }
            ]
          );
        } else {
          Alert.alert("Hata", "Girdiğiniz bilgiler hatalı.");
        }
        
      } else if (error.code === 'auth/email-already-in-use') {
         Alert.alert("Kayıtlı Hesap", "Bu e-posta adresi zaten kullanılıyor. Giriş yapmayı deneyin.", [
           { text: "Tamam" },
           { text: "Giriş Yap", onPress: () => setMode('login') }
         ]);
      } else {
        Alert.alert("Hata", "Bir sorun oluştu: " + error.message);
      }
      // -------------------------------------
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent:'center'}} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}><Ionicons name="business" size={50} color={COLORS.accent} /></View>
          <Text style={styles.appName}>EmlakPro</Text>
          <Text style={styles.appSub}>
            {mode === 'login' ? 'Tekrar Hoşgeldiniz' : 'Yeni Hesap Oluştur'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          
          {mode === 'register' && (
            <>
              <Text style={styles.label}>Hesap Türü</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.typeBtn, accountType === 'user' && styles.typeBtnActive]} onPress={() => setAccountType('user')}>
                  <Ionicons name="person" size={20} color={accountType === 'user' ? 'white' : COLORS.textGray} />
                  <Text style={[styles.btnText, accountType === 'user' && {color:'white'}]}>Bireysel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, accountType === 'agent' && styles.typeBtnActive]} onPress={() => setAccountType('agent')}>
                  <Ionicons name="briefcase" size={20} color={accountType === 'agent' ? 'white' : COLORS.textGray} />
                  <Text style={[styles.btnText, accountType === 'agent' && {color:'white'}]}>Danışman</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput style={styles.input} placeholder="Ad Soyad" placeholderTextColor="#64748B" value={name} onChangeText={setName}/>

              <Text style={styles.label}>Cinsiyet</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.optionBtn, selectedGender === 'Erkek' && styles.optionBtnActive]} onPress={() => setSelectedGender('Erkek')}><Text style={styles.btnText}>Erkek</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.optionBtn, selectedGender === 'Kadın' && styles.optionBtnActive]} onPress={() => setSelectedGender('Kadın')}><Text style={styles.btnText}>Kadın</Text></TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.label}>E-Posta Adresi</Text>
          <TextInput style={styles.input} placeholder="mail@site.com" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>

          <Text style={styles.label}>Şifre</Text>
          <TextInput style={styles.input} placeholder="******" placeholderTextColor="#64748B" secureTextEntry value={password} onChangeText={setPassword}/>

          <TouchableOpacity onPress={handleAuth} style={{marginTop: 15}} disabled={loading}>
            <LinearGradient colors={['#FF6F00', '#F59E0B']} style={styles.loginButton}>
              {loading ? <ActivityIndicator color="white"/> : <Text style={styles.loginText}>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{marginTop: 20, padding: 10}} 
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={{color: COLORS.accent, textAlign:'center', fontWeight:'bold'}}>
              {mode === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 20, marginTop: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: COLORS.accent },
  appName: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  appSub: { color: COLORS.textGray },
  formContainer: { backgroundColor: COLORS.cardBg, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  label: { color: 'white', marginBottom: 5, marginLeft: 5, fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#0F172A', color: 'white', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  loginButton: { padding: 15, borderRadius: 12, alignItems: 'center' },
  loginText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  typeBtn: { flex: 1, flexDirection:'row', alignItems: 'center', justifyContent:'center', padding: 12, borderRadius: 10, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  typeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  optionBtn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155' },
  optionBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  btnText: { color: COLORS.textGray, fontSize: 12, fontWeight:'bold', marginLeft: 5 }
});