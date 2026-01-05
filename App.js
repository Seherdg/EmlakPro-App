import * as React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProvider } from './src/context/UserContext'; 

// EKRANLAR
import LoginScreen from './src/screens/LoginScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import AddListingScreen from './src/screens/AddListingScreen';
import CreateScreen from './src/screens/CreateScreen';
import SearchScreen from './src/screens/SearchScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen'; // YENİ
import AgentsScreen from './src/screens/AgentsScreen'; // YENİ

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity style={{ top: -20, justifyContent: 'center', alignItems: 'center', ...styles.shadow }} onPress={onPress}>
    <LinearGradient colors={['#FF6F00', '#F59E0B']} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#0F172A' }}>{children}</LinearGradient>
  </TouchableOpacity>
);

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: { position: 'absolute', bottom: 20, left: 20, right: 20, elevation: 0, backgroundColor: '#1E293B', borderRadius: 20, height: 70, borderTopWidth: 0, ...styles.shadow } }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? "#F59E0B" : "#94A3B8"} /> }} />
      {/* Keşfet yerine Danışmanlar sayfasını koyduk */}
      <Tab.Screen name="AgentsTab" component={AgentsScreen} options={{ tabBarIcon: ({ focused }) => <Ionicons name={focused ? "people" : "people-outline"} size={24} color={focused ? "#F59E0B" : "#94A3B8"} /> }} />
      <Tab.Screen name="AddTab" component={CreateScreen} options={{ tabBarIcon: ({ focused }) => <Ionicons name="add" size={35} color="white" />, tabBarButton: (props) => <CustomTabBarButton {...props} /> }} listeners={({ navigation }) => ({ tabPress: (e) => { e.preventDefault(); navigation.navigate('CreateListing'); }, })} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ tabBarIcon: ({ focused }) => <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={focused ? "#F59E0B" : "#94A3B8"} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? "#F59E0B" : "#94A3B8"} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#F59E0B', headerTitleStyle: { fontWeight: 'bold' } }}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false }} /> 
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} /> 
          <Stack.Screen name="AddListing" component={AddListingScreen} options={{ title: 'AI Fiyat Tahmini' }} />
          <Stack.Screen name="CreateListing" component={CreateScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'İlanlarım' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({ shadow: { shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 3.5, elevation: 5 } });