import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';


function plural(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'товар';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'товара';
  return 'товаров';
}

export default function OrdersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, shadows, isDark } = useTheme();

  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded,   setExpanded]   = useState({});

  const load = useCallback(async () => {
    const res = await api.myOrders();
    if (res.success) setOrders(res.orders || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
      {/* Header card */}
      <View style={[styles.headerOuter, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerCard, { backgroundColor: isDark ? '#000' : '#fff', borderColor: colors.primary }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primaryLight }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Мои заказы</Text>
          <View style={{ width: 38 }} />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Заказов пока нет</Text>
              <TouchableOpacity
                style={[styles.shopBtn, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('CatalogTab')}
              >
                <Text style={[styles.shopBtnText, { color: colors.primary }]}>Перейти в каталог</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: order }) => {
            const isOpen    = !!expanded[order.id];
            const count     = order.item_count ?? (order.items?.length ?? 0);
            const dateStr   = order.created_at
              ? new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
              : '';

            return (
              <View style={[styles.card, { backgroundColor: colors.card, ...shadows.sm }]}>
                {/* Top row */}
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderId, { color: colors.text }]}>Заказ №{order.user_order_number ?? order.id}</Text>
                    {dateStr ? <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{dateStr}</Text> : null}
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

                {/* Bottom row */}
                <View style={styles.cardBottom}>
                  <TouchableOpacity
                    style={styles.expandBtn}
                    onPress={() => toggleExpand(order.id)}
                  >
                    <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                      {count} {plural(count)}
                    </Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={14} color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.total, { color: colors.primary }]}>
                    {Number(order.total).toLocaleString('ru-RU')} ₽
                  </Text>
                </View>

                {/* Expanded items */}
                {isOpen && order.items && order.items.length > 0 && (
                  <View style={[styles.itemsWrap, { borderTopColor: colors.borderLight }]}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <View style={styles.itemRight}>
                          <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                            ×{item.quantity ?? item.qty}
                          </Text>
                          <Text style={[styles.itemPrice, { color: colors.text }]}>
                            {Number(item.price).toLocaleString('ru-RU')} ₽
                          </Text>
                        </View>
                      </View>
                    ))}
                    {order.address ? (
                      <Text style={[styles.address, { color: colors.textSecondary }]}>
                        📍 {order.address}
                      </Text>
                    ) : null}
                  </View>
                )}

              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerOuter:  { paddingHorizontal: SIZES.screenPadding, paddingTop: 10, paddingBottom: 8 },
  headerCard:   {
    borderRadius: 18, borderWidth: 2,
    paddingHorizontal: SIZES.screenPadding, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn:      { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 18, fontWeight: '700' },
  list:        { padding: SIZES.screenPadding, gap: 12, flexGrow: 1 },
  card:        { borderRadius: SIZES.cardRadius, padding: 16, gap: 12 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  orderId:     { fontSize: 15, fontWeight: '700' },
  orderDate:   { fontSize: 12, marginTop: 2 },
  divider:     { height: 1 },
  cardBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemCount:   { fontSize: 13 },
  total:       { fontSize: 18, fontWeight: '800' },
  itemsWrap:   { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  itemRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  itemName:    { flex: 1, fontSize: 13 },
  itemRight:   { flexDirection: 'row', gap: 8, alignItems: 'center' },
  itemQty:     { fontSize: 12 },
  itemPrice:   { fontSize: 13, fontWeight: '600' },
  address:     { fontSize: 12, marginTop: 4 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
  emptyTitle:  { fontSize: 16, fontWeight: '600' },
  shopBtn:     { borderWidth: 1.5, borderRadius: SIZES.buttonRadius, paddingHorizontal: 24, paddingVertical: 11 },
  shopBtnText: { fontSize: 14, fontWeight: '600' },
});
