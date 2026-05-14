import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import ProductCard from '../components/ProductCard';

const PER_PAGE = 12;

export default function CatalogScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors, shadows, isDark } = useTheme();

  const initCategory = route.params?.category_id  || '';
  const initSearch   = route.params?.search       || '';
  const initTitle    = route.params?.categoryName || 'Каталог';

  const [products,    setProducts]    = useState([]);
  const [favorites,   setFavorites]   = useState(new Set());
  const [search,      setSearch]      = useState(initSearch);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categoryId,  setCategoryId]  = useState(initCategory);
  const [categories,  setCategories]  = useState([]);
  const searchTimeout = useRef(null);

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  useEffect(() => {
    if (route.params?.search)      setSearch(route.params.search);
    if (route.params?.category_id) setCategoryId(route.params.category_id);
  }, [route.params]);

  useEffect(() => { api.categories().then(r => r.success && setCategories(r.categories)); }, []);

  const fetchProducts = useCallback(async (pg = 1, reset = true) => {
    if (pg === 1) reset ? setLoading(true) : setRefreshing(true);
    else          setLoadingMore(true);

    const res = await api.products({
      page: pg, per_page: PER_PAGE,
      search:      search      || undefined,
      category_id: categoryId  || undefined,
      in_stock:    inStockOnly ? 1 : undefined,
    });

    if (res.success) {
      setProducts(pg === 1 ? res.products : prev => [...prev, ...res.products]);
      setTotalPages(res.pages);
      setTotal(res.total);
      setPage(pg);
    }

    setLoading(false); setLoadingMore(false); setRefreshing(false);
  }, [search, categoryId, inStockOnly]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const handleSearchChange = (text) => {
    setSearch(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchProducts(1), 500);
  };

  const loadMore = () => {
    if (!loadingMore && page < totalPages) fetchProducts(page + 1, false);
  };

  const loadFavorites = useCallback(async () => {
    if (user) {
      const res = await api.favorites();
      if (res.success) setFavorites(new Set(res.favorites.map(f => Number(f.id))));
    }
  }, [user]);
  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const toggleFav = async (productId) => {
    if (!user) { navigation.navigate('ProfileTab', { screen: 'Login' }); return; }
    const id = Number(productId);
    try {
      const res = await api.toggleFavorite(id);
      if (res.success) {
        setFavorites(prev => {
          const next = new Set(prev);
          res.action === 'added' ? next.add(id) : next.delete(id);
          return next;
        });
      } else {
        Alert.alert('Ошибка избранного', res.message || JSON.stringify(res));
      }
    } catch (e) {
      Alert.alert('Ошибка сети', e.message || String(e));
    }
  };

  const applyFilters = () => { setFilterOpen(false); fetchProducts(1); };
  const resetFilters = () => { setCategoryId(''); setInStockOnly(false); };

  const activeFilters = (categoryId ? 1 : 0) + (inStockOnly ? 1 : 0);

  const renderItem = ({ item }) => (
    <ProductCard
      product={item}
      style={styles.card}
      isFavorited={favorites.has(Number(item.id))}
      onFavoriteToggle={toggleFav}
      onPress={() => navigation.navigate('Product', { id: item.id })}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header card */}
      <View style={[styles.headerOuter, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerCard, { backgroundColor: isDark ? '#000' : '#fff', borderColor: colors.primary }]}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{initTitle}</Text>
            {total > 0 && <Text style={styles.count}>{total} товаров</Text>}
          </View>
          {/* Search + Filter */}
          <View style={styles.toolbar}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? '#1a1a1a' : colors.inputBg, borderColor: isDark ? '#333' : colors.border }]}>
              <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск..."
                placeholderTextColor={colors.textTertiary}
                value={search}
                onChangeText={handleSearchChange}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchChange('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
              onPress={() => setFilterOpen(true)}
            >
              <Ionicons name="options-outline" size={18} color={activeFilters > 0 ? '#fff' : colors.text} />
              {activeFilters > 0 && (
                <View style={styles.filterCountWrap}>
                  <Text style={styles.filterCountTxt}>{activeFilters}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={60} color={colors.border} />
          <Text style={styles.emptyText}>Товары не найдены</Text>
          <TouchableOpacity onPress={() => { setSearch(''); resetFilters(); }}>
            <Text style={styles.emptyReset}>Сбросить фильтры</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => String(p.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(1, true)} tintColor={colors.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore
            ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={filterOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Фильтры</Text>
            <TouchableOpacity onPress={() => setFilterOpen(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SIZES.screenPadding, gap: 20 }}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setInStockOnly(v => !v)}>
              <View style={[styles.checkbox, inStockOnly && styles.checkboxActive]}>
                {inStockOnly && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkLabel}>Только в наличии</Text>
            </TouchableOpacity>

            <View>
              <Text style={styles.filterGroupTitle}>Категория</Text>
              <View style={styles.chips}>
                <TouchableOpacity
                  style={[styles.chip, !categoryId && styles.chipActive]}
                  onPress={() => setCategoryId('')}
                >
                  <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>Все</Text>
                </TouchableOpacity>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, categoryId == c.id && styles.chipActive]}
                    onPress={() => setCategoryId(c.id)}
                  >
                    <Text style={[styles.chipText, categoryId == c.id && styles.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetBtnText}>Сбросить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyBtnText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: colors.surface },
    center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerOuter:     { paddingHorizontal: SIZES.screenPadding, paddingTop: 10, paddingBottom: 8 },
    headerCard:      { borderRadius: 18, borderWidth: 2, paddingHorizontal: SIZES.screenPadding, paddingTop: 14, paddingBottom: 12, gap: 10 },
    titleRow:        { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    title:           { fontSize: 22, fontWeight: '800', color: colors.text },
    count:           { fontSize: 13, color: colors.textSecondary },
    toolbar:         { flexDirection: 'row', gap: 10 },
    searchBox:       {
      flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: SIZES.inputRadius, paddingHorizontal: 12, paddingVertical: 9,
      borderWidth: 1,
    },
    searchInput:     { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
    filterBtn:       {
      width: 42, height: 42, borderRadius: SIZES.inputRadius,
      backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border, position: 'relative',
    },
    filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterCountWrap: {
      position: 'absolute', top: 3, right: 3,
      backgroundColor: colors.primary, borderRadius: 8,
      width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    },
    filterCountTxt:  { color: '#fff', fontSize: 10, fontWeight: '800', lineHeight: 16 },
    list:            { padding: SIZES.screenPadding, paddingTop: 12 },
    row:             { gap: 12, marginBottom: 12 },
    card:            { flex: 1 },
    empty:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText:       { fontSize: 16, color: colors.textSecondary },
    emptyReset:      { fontSize: 14, color: colors.primary, fontWeight: '600' },

    modal:           { flex: 1, backgroundColor: colors.card },
    modalHeader:     {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: SIZES.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    modalTitle:      { fontSize: 18, fontWeight: '700', color: colors.text },
    checkRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkbox:        {
      width: 22, height: 22, borderRadius: 6,
      borderWidth: 2, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive:  { backgroundColor: colors.primary, borderColor: colors.primary },
    checkLabel:      { fontSize: 15, color: colors.text },
    filterGroupTitle:{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 },
    chips:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip:            {
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 20, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    chipActive:      { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    chipText:        { fontSize: 13, color: colors.text },
    chipTextActive:  { color: colors.primary, fontWeight: '600' },
    modalFooter:     {
      flexDirection: 'row', gap: 12, padding: SIZES.screenPadding,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    resetBtn:        {
      flex: 1, paddingVertical: 14, borderRadius: SIZES.buttonRadius,
      borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
    },
    resetBtnText:    { fontSize: 15, fontWeight: '600', color: colors.text },
    applyBtn:        {
      flex: 2, paddingVertical: 14, borderRadius: SIZES.buttonRadius,
      backgroundColor: colors.primary, alignItems: 'center',
    },
    applyBtnText:    { fontSize: 15, fontWeight: '700', color: '#fff' },
  });
}
