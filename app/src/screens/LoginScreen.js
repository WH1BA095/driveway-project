import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import Logo from '../components/Logo';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { loadFromServer } = useCart();
  const { colors, shadows, isDark, toggleTheme } = useTheme();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      loadFromServer();
    } catch (e) {
      Alert.alert('Ошибка входа', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header card — как на других экранах */}
        <View style={[styles.headerOuter, { backgroundColor: colors.surface }]}>
          <View style={[styles.headerCard, {
            backgroundColor: isDark ? '#000' : '#fff',
            borderColor: colors.primary,
          }]}>
            {/* Левый отступ для симметрии */}
            <View style={{ width: 38 }} />

            {/* Логотип по центру */}
            <Logo variant={isDark ? 'onDark' : 'onLight'} size="xl" />

            {/* Кнопка темы справа */}
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: colors.primaryLight }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Войдите в аккаунт</Text>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="example@mail.ru"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.text }]}>Пароль</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Минимум 6 символов"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, ...shadows.md }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Войти</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Нет аккаунта?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Зарегистрироваться</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    headerOuter: { paddingHorizontal: SIZES.screenPadding, paddingTop: 10, paddingBottom: 8 },
    headerCard:  {
      borderRadius: 18, borderWidth: 2,
      paddingHorizontal: SIZES.screenPadding, paddingVertical: 16,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    themeBtn:    { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    subtitle:    { fontSize: 15, textAlign: 'center', marginTop: 20, marginBottom: 8 },
    form:        { paddingHorizontal: SIZES.screenPadding, gap: 16, marginTop: 8 },
    fieldWrap:   { gap: 6 },
    label:       { fontSize: 14, fontWeight: '600' },
    inputWrap:   {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      borderWidth: 1, borderRadius: SIZES.inputRadius,
      paddingHorizontal: 14, paddingVertical: 13,
    },
    input:       { flex: 1, fontSize: 15, padding: 0 },
    btn:         { borderRadius: SIZES.buttonRadius, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
    btnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
    link:        { alignItems: 'center', paddingVertical: 8 },
    linkText:    { fontSize: 14 },
  });
}
