import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, query, orderBy, onSnapshot, where, or, and } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { UserContext } from '../context/UserContext';

const COLORS = { background: '#0F172A', cardBg: '#1E293B', accent: '#F59E0B', text: '#FFFFFF', textGray: '#94A3B8', sender: '#F59E0B', receiver: '#334155' };

export default function ChatScreen({ route, navigation }) {
  // Karşı tarafın ID'sini ve İsmini alıyoruz
  const { receiverId, receiverName } = route.params; 
  const { user } = useContext(UserContext); // Kendi bilgilerim
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    // Mesajları Getir (Gönderen veya Alan ben isem VE karşı taraf o ise)
    // Firestore'da karmaşık sorgular yerine "chatId" mantığıyla basit tutuyoruz:
    // Her mesajda senderId ve receiverId olacak.
    
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sadece bu sohbetin mesajlarını filtrele (Client-side filtreleme demo için daha kolay)
      const chatMessages = allMessages.filter(m => 
        (m.senderId === currentUserId && m.receiverId === receiverId) ||
        (m.senderId === receiverId && m.receiverId === currentUserId)
      );
      
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [receiverId]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    await addDoc(collection(db, "messages"), {
      text: inputText,
      senderId: currentUserId,
      receiverId: receiverId,
      createdAt: new Date().toISOString(),
      senderName: user.name // Bildirim listesi için isim de ekleyelim
    });

    setInputText('');
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[styles.msgBubble, isMe ? styles.me : styles.other]}>
        <Text style={styles.msgText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:10}}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
           <Text style={{fontSize:18}}>👤</Text>
        </View>
        <View>
          <Text style={styles.headerName}>{receiverName || 'Kullanıcı'}</Text>
          <Text style={styles.headerStatus}>Çevrimiçi</Text>
        </View>
      </View>

      {/* Mesaj Listesi */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted // Mesajlar aşağıdan yukarı gelir
        contentContainerStyle={{ padding: 15 }}
      />

      {/* Mesaj Yazma Alanı */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Mesaj yazın..." 
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: 50, backgroundColor: COLORS.cardBg, borderBottomWidth:1, borderColor: '#334155' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent:'center', alignItems:'center', marginHorizontal: 10 },
  headerName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  headerStatus: { color: COLORS.accent, fontSize: 12 },
  
  msgBubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '80%' },
  me: { alignSelf: 'flex-end', backgroundColor: COLORS.sender, borderBottomRightRadius: 2 },
  other: { alignSelf: 'flex-start', backgroundColor: COLORS.receiver, borderBottomLeftRadius: 2 },
  msgText: { color: 'white', fontSize: 15 },

  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: COLORS.cardBg, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#0F172A', color: 'white', padding: 12, borderRadius: 20, marginRight: 10 },
  sendBtn: { backgroundColor: COLORS.accent, width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});