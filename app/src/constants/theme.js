export const lightColors = {
  primary:        '#E3160B',
  primaryDark:    '#B50D03',
  primaryLight:   'rgba(227,22,11,0.12)',
  primaryBg:      '#FFF5F5',
  background:     '#FFFFFF',
  surface:        '#F7F7F7',
  card:           '#FFFFFF',
  text:           '#1A1A1A',
  textSecondary:  '#666666',
  textTertiary:   '#AAAAAA',
  border:         '#E8E8E8',
  borderLight:    '#F2F2F2',
  success:        '#2E7D32',
  successBg:      '#E8F5E9',
  warning:        '#F57C00',
  error:          '#D32F2F',
  star:           '#F5A623',
  overlay:        'rgba(0,0,0,0.45)',
  tabBar:         '#FFFFFF',
  tabBarBorder:   '#EEEEEE',
  inputBg:        '#F7F7F7',
  skeleton:       '#EEEEEE',
};

export const darkColors = {
  primary:        '#E3160B',
  primaryDark:    '#B50D03',
  primaryLight:   'rgba(227,22,11,0.18)',
  primaryBg:      '#2A0500',
  background:     '#121212',
  surface:        '#1E1E1E',
  card:           '#252525',
  text:           '#F0F0F0',
  textSecondary:  '#999999',
  textTertiary:   '#555555',
  border:         '#333333',
  borderLight:    '#2A2A2A',
  success:        '#66BB6A',
  successBg:      '#1B2E1C',
  warning:        '#FFA726',
  error:          '#EF5350',
  star:           '#F5A623',
  overlay:        'rgba(0,0,0,0.65)',
  tabBar:         '#1A1A1A',
  tabBarBorder:   '#2C2C2C',
  inputBg:        '#2A2A2A',
  skeleton:       '#2C2C2C',
};

// Для обратной совместимости
export const COLORS = lightColors;

export const SIZES = {
  xs:   4,
  sm:   8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl:32,
  screenPadding: 16,
  cardRadius:    14,
  buttonRadius:  12,
  inputRadius:   12,
};

export const lightShadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,  elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 8,  elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.13, shadowRadius: 16, elevation: 8 },
};
export const darkShadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 4,  elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,  elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 },
};

export const SHADOWS = lightShadows;
