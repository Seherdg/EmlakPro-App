import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore'; // where eklendi
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8' };

export default function AgentsScreen({ navigation }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // SADECE HESAP TÜRÜ 'agent' OLANLARI GETİR
        const q = query(collection(db, "users"), where("accountType", "==", "agent"));
        
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Kendimi listeden çıkar (Eğer ben de emlakçıysam kendime mesaj atmayayım)
        const filteredList = usersList.filter(u => u.id !== auth.currentUser?.uid);
        
        setAgents(filteredList);
      } catch (error) {
        console.log("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const renderAgent = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Chat', { receiverId: item.id, receiverName: item.name })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{flex:1}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>🏠 {item.role}</Text> 
      </View>
      <View style={styles.msgBtn}>
        <Ionicons name="chatbubble-ellipses" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Uzman Danışmanlar</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={agents}
          renderItem={renderAgent}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={{alignItems:'center', marginTop: 50}}>
              <Ionicons name="briefcase-outline" size={50} color={COLORS.textGray} />
              <Text style={{color:'white', marginTop:10}}>Kayıtlı emlak danışmanı bulunamadı.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.cardBg, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 15, marginBottom: 15, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth:2, borderColor: COLORS.accent },
  name: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  role: { color: COLORS.accent, fontSize: 12, marginTop: 5, fontWeight:'bold' },
  msgBtn: { backgroundColor: COLORS.accent, padding: 10, borderRadius: 12 }
});