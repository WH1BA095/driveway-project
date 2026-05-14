import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function StarRating({ rating = 0, count, size = 14, showNumber = true }) {
  const { colors } = useTheme();

  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={styles.row}>
      {Array.from({ length: full  }).map((_, i) => (
        <Ionicons key={`f${i}`} name="star"         size={size} color={colors.star} />
      ))}
      {half && <Ionicons name="star-half" size={size} color={colors.star} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Ionicons key={`e${i}`} name="star-outline" size={size} color={colors.star} />
      ))}
      {showNumber && rating > 0 && (
        <Text style={[styles.num, { fontSize: size, color: colors.text }]}>
          {rating.toFixed(1)}
        </Text>
      )}
      {count !== undefined && (
        <Text style={[styles.cnt, { fontSize: size - 1, color: colors.textSecondary }]}>
          ({count})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  num: { fontWeight: '600', marginLeft: 4 },
  cnt: { marginLeft: 2 },
});
