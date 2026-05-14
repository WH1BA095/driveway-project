import React, { useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import StarRating from './StarRating';
import { getImageUrl } from '../api';

export default function ProductCard({ product, onPress, onFavoriteToggle, isFavorited = false, style }) {
  const { colors, shadows } = useTheme();
  const [favLoading, setFavLoading] = useState(false);

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const handleFav = async () => {
    if (!onFavoriteToggle) return;
    setFavLoading(true);
    try { await onFavoriteToggle(product.id); }
    finally { setFavLoading(false); }
  };

  const imageUri = getImageUrl(product.image);
  const inStock  = product.available > 0 || product.in_stock;

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imgWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Ionicons name="cube-outline" size={36} color={colors.border} />
          </View>
        )}
        {/* Stock badge */}
        <View style={[styles.badge, inStock ? styles.badgeIn : styles.badgeOut]}>
          <Text style={[styles.badgeText, { color: inStock ? colors.success : colors.error }]}>
            {inStock ? 'В наличии' : 'Нет'}
          </Text>
        </View>
        {/* Favourite button */}
        {onFavoriteToggle && (
          <TouchableOpacity style={styles.favBtn} onPress={handleFav} activeOpacity={0.7}>
            {favLoading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorited ? colors.primary : colors.textSecondary}
                />
            }
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {product.avg_rating > 0 && (
          <StarRating rating={product.avg_rating} count={product.review_count} size={12} />
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>
            {Number(product.price).toLocaleString('ru-RU')} ₽
          </Text>
          <View style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={16} color="#fff" />
          </View>
        </View>

        {product.article && (
          <Text style={styles.article}>Арт. {product.article}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: SIZES.cardRadius,
      overflow: 'hidden',
      flexDirection: 'column',
      ...shadows.sm,
    },
    imgWrap: {
      width: '100%',
      aspectRatio: 4 / 3,
      backgroundColor: colors.inputBg,
      position: 'relative',
    },
    img:            { width: '100%', height: '100%' },
    imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute', top: 8, left: 8,
      paddingHorizontal: 7, paddingVertical: 3,
      borderRadius: 20, borderWidth: 1,
    },
    badgeIn:   { backgroundColor: colors.successBg, borderColor: '#C8E6C9' },
    badgeOut:  { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    badgeText: { fontSize: 10, fontWeight: '600' },
    favBtn: {
      position: 'absolute', top: 6, right: 6,
      backgroundColor: colors.card,
      borderRadius: 20, width: 32, height: 32,
      alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },
    body:    { padding: 10, gap: 5, flex: 1, justifyContent: 'space-between', minHeight: 110 },
    name:    { fontSize: 13, fontWeight: '500', color: colors.text, lineHeight: 18 },
    footer:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    price:   { fontSize: 16, fontWeight: '700', color: colors.primary },
    cartBtn: {
      width: 30, height: 30, borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    article: { fontSize: 10, color: colors.textTertiary },
  });
}
