import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

const ICONS = {
  engine:       'settings-outline',
  transmission: 'git-merge-outline',
  suspension:   'car-sport-outline',
  brakes:       'disc-outline',
  steering:     'navigate-circle-outline',
  electrics:    'flash-outline',
  wheels:       'ellipse-outline',
  oils:         'water-outline',
  accessories:  'bag-handle-outline',
};

export default function CategoryCard({ category, onPress, style }) {
  const { colors, shadows } = useTheme();
  const icon = ICONS[category.slug] || 'cube-outline';

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={2}>{category.name}</Text>
    </TouchableOpacity>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: SIZES.cardRadius,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 6,
      ...shadows.sm,
    },
    iconWrap: {
      width: 46, height: 46, borderRadius: 23,
      backgroundColor: colors.primaryLight,
      alignItems: 'center', justifyContent: 'center',
    },
    name: {
      fontSize: 11, fontWeight: '500',
      color: colors.text, textAlign: 'center', lineHeight: 14,
    },
  });
}
