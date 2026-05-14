import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../api';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

import HomeScreen      from '../screens/HomeScreen';
import CatalogScreen   from '../screens/CatalogScreen';
import ProductScreen   from '../screens/ProductScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen   from '../screens/ProfileScreen';
import LoginScreen     from '../screens/LoginScreen';
import RegisterScreen  from '../screens/RegisterScreen';
import CarsScreen      from '../screens/CarsScreen';
import OrdersScreen    from '../screens/OrdersScreen';
import CartScreen      from '../screens/CartScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const noHeader = { headerShown: false };

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="HomeMain"  component={HomeScreen} />
      <Stack.Screen name="Product"   component={ProductScreen} />
    </Stack.Navigator>
  );
}

function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="CatalogMain" component={CatalogScreen} />
      <Stack.Screen name="Product"     component={ProductScreen} />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <Stack.Screen name="Product"       component={ProductScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={noHeader}>
      {user ? (
        <>
          <Stack.Screen name="ProfileMain" component={ProfileScreen} />
          <Stack.Screen name="Cars"        component={CarsScreen} />
          <Stack.Screen name="Orders"      component={OrdersScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="CartMain" component={CartScreen} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { user }     = useAuth();
  const { colors, isDark } = useTheme();
  const { itemCount } = useCart();

  // Тема для NavigationContainer
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.surface,
      card:       colors.card,
      text:       colors.text,
      border:     colors.border,
      primary:    colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor:  colors.tabBarBorder,
            borderTopWidth:  StyleSheet.hairlineWidth,
          },
          tabBarItemStyle: { paddingTop: 6 },
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ focused, color }) => {
            const icons = {
              HomeTab:      focused ? 'home'  : 'home-outline',
              CatalogTab:   focused ? 'grid'  : 'grid-outline',
              FavoritesTab: focused ? 'heart' : 'heart-outline',
              CartTab:      focused ? 'cart'  : 'cart-outline',
            };

            if (route.name === 'ProfileTab') {
              if (user) {
                const avatarUri = getImageUrl(user.avatar);
                if (avatarUri) {
                  return (
                    <View style={[
                      styles.tabAvatar,
                      { borderColor: focused ? colors.primary : colors.border }
                    ]}>
                      <Image source={{ uri: avatarUri }} style={styles.tabAvatarImg} />
                    </View>
                  );
                }
                // Нет фото — инициал в кружке
                return (
                  <View style={[
                    styles.tabAvatar,
                    { borderColor: focused ? colors.primary : colors.border,
                      backgroundColor: focused ? colors.primaryLight : colors.inputBg }
                  ]}>
                    <Text style={[styles.tabAvatarLetter, { color: focused ? colors.primary : colors.textTertiary }]}>
                      {(user.firstname || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                );
              }
              // Не авторизован — обычная иконка
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />;
            }

            return (
              <View>
                <Ionicons name={icons[route.name]} size={22} color={color} />
                {route.name === 'CartTab' && itemCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                  </View>
                )}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="HomeTab"      component={HomeStack}      options={{ title: 'Главная'  }} />
        <Tab.Screen name="CatalogTab"   component={CatalogStack}   options={{ title: 'Каталог'  }} />
        <Tab.Screen name="FavoritesTab" component={FavoritesStack} options={{ title: 'Избранное'}} />
        <Tab.Screen name="CartTab"      component={CartStack}      options={{ title: 'Корзина'  }} />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStack}
          options={{ title: user ? (user.firstname || 'Профиль') : 'Войти' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -4, right: -8,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText:       { fontSize: 9, fontWeight: '800', color: '#fff' },
  tabAvatar:       {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  tabAvatarImg:    { width: '100%', height: '100%' },
  tabAvatarLetter: { fontSize: 12, fontWeight: '700' },
});
