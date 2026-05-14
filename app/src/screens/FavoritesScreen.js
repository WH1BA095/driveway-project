import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import ProductCard from '../components/ProductCard';

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors, shadows, isDark } = useTheme();

  const [products,   setProducts]   = useState([]);
  const [favIds,     setFavIds]     = useState(new Set());
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const res = await api.favorites();
    if (res.success) {
      setProducts(res.favorites);
      setFavIds(new Set(res.favorites.map(f => Number(f.id))));
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const toggleFav = async (productId) => {
    const id = Number(productId);
    try {
      const res = await api.toggleFavorite(id);
      if (res.success) {
        if (res.action === 'removed') {
          setProducts(prev => prev.filter(p => Number(p.id) !== id));
          setFavIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        }
      } else {
        Alert.alert('Ошибка избранного', res.message || JSON.stringify(res));
      }
    } catch (e) {
      Alert.alert('Ошибка сети', e.message || String(e));
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="heart-outline" size={64} color={colors.border} />
        <Text style={styles.emptyTitle}>Войдите, чтобы видеть избранное</Text>
        <TouchableOpacity
          style={styles.authBtn}
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Login' })}
        >
          <Text style={styles.authBtnText}>Войти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.headerOuter, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerCard, { backgroundColor: isDark ? '#000' : '#fff', borderColor: colors.primary }]}>
          <Text style={styles.title}>Избранное</Text>
          {products.length > 0 && (
            <Text style={styles.count}>{products.length} товаров</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>Список избранного пуст</Text>
          <Text style={styles.emptyText}>Добавляйте товары, нажимая на ♥</Text>
          <TouchableOpacity
            style={styles.catalogBtn}
            onPress={() => navigation.navigate('CatalogTab')}
          >
            <Text style={styles.catalogBtnText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => String(p.id)}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              style={styles.card}
              isFavorited={favIds.has(Number(item.id))}
              onFavoriteToggle={toggleFav}
              onPress={() => navigation.navigate('Product', { id: item.id })}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    container:      { flex: 1, backgroundColor: colors.surface },
    center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
    headerOuter:    { paddingHorizontal: SIZES.screenPadding, paddingTop: 10, paddingBottom: 8 },
    headerCard:     { borderRadius: 18, borderWidth: 2, paddingHorizontal: SIZES.screenPadding, paddingVertical: 14, gap: 4 },
    title:          { fontSize: 22, fontWeight: '800', color: colors.text },
    count:          { fontSize: 13, color: colors.textSecondary },
    list:           { padding: SIZES.screenPadding },
    row:            { gap: 12, marginBottom: 12 },
    card:           { flex: 1 },
    emptyTitle:     { fontSize: 17, fontWeight: '600', color: colors.text },
    emptyText:      { fontSize: 14, color: colors.textSecondary },
    authBtn:        {
      backgroundColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingHorizontal: 32, paddingVertical: 13,
      ...shadows.md,
    },
    authBtnText:    { fontSize: 15, fontWeight: '700', color: '#fff' },
    catalogBtn:     {
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingHorizontal: 24, paddingVertical: 11,
    },
    catalogBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  });
}
