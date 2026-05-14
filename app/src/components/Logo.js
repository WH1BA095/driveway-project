import React from 'react';
import { Image } from 'react-native';

// Точно как на сайте:
// bigLogo11 — для светлого фона (светлая тема, белый хедер)
// bigLogo22 — для тёмного фона  (тёмная тема, чёрный/красный хедер)
const bigLogo11 = require('../../assets/bigLogo11.png'); // тёмный логотип
const bigLogo22 = require('../../assets/bigLogo22.png'); // светлый логотип

const HEIGHTS = { sm: 22, md: 32, lg: 44, xl: 60 };

/**
 * variant='onDark'  → bigLogo22 (белый лого на тёмном/красном/чёрном фоне)
 * variant='onLight' → bigLogo11 (тёмный лого на белом/светлом фоне)
 */
export default function Logo({ variant = 'onDark', size = 'md', style }) {
  const h      = HEIGHTS[size] ?? HEIGHTS.md;
  // bigLogo11/22 имеют пропорцию ~1547:488 ≈ 3.17:1
  const w      = Math.round(h * 3.17);
  const source = variant === 'onLight' ? bigLogo11 : bigLogo22;

  return (
    <Image
      source={source}
      style={[{ height: h, width: w }, style]}
      resizeMode="contain"
    />
  );
}
