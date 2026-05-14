import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { colors, shadows, isDark, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', password: '', password2: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.firstname || !form.email || !form.password) {
      Alert.alert('Ошибка', 'Заполните обязательные поля'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert('Ошибка', 'Введите корректный email'); return;
    }
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона'); return;
    }
    if (form.password.length < 6) {
      Alert.alert('Ошибка', 'Пароль минимум 6 символов'); return;
    }
    if (form.password !== form.password2) {
      Alert.alert('Ошибка', 'Пароли не совпадают'); return;
    }
    setLoading(true);
    try {
      await register({
        firstname: form.firstname.trim(),
        lastname:  form.lastname.trim(),
        email:     form.email.trim().toLowerCase(),
        phone:     form.phone.trim(),
        password:  form.password,
      });
      // Навигация происходит автоматически через смену user в AuthContext
    } catch (e) {
      Alert.alert('Ошибка регистрации', e.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, fieldKey, placeholder, keyboardType, secureEntry, icon, required }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>
        {label}{required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      <View style={styles.inputWrap}>
        {icon && <Ionicons name={icon} size={18} color={colors.textSecondary} />}
        <TextInput
          style={styles.input}
          value={form[fieldKey]}
          onChangeText={set(fieldKey)}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureEntry && !showPass}
          autoCapitalize={fieldKey === 'email' ? 'none' : 'words'}
          autoCorrect={false}
        />
        {fieldKey === 'password' && (
          <TouchableOpacity onPress={() => setShowPass(v => !v)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Регистрация</Text>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.inputBg }]}
            onPress={toggleTheme}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Имя <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={form.firstname}
                  onChangeText={set('firstname')}
                  placeholder="Иван"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.label}>Фамилия</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={form.lastname}
                  onChangeText={set('lastname')}
                  placeholder="Иванов"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
          </View>

          <Field label="Email"            fieldKey="email"     placeholder="example@mail.ru"        keyboardType="email-address" icon="mail-outline"        required />
          <Field label="Телефон"          fieldKey="phone"     placeholder="+7 (999) 123-45-67"     keyboardType="phone-pad"     icon="call-outline" />
          <Field label="Пароль"           fieldKey="password"  placeholder="Минимум 6 символов"      secureEntry              icon="lock-closed-outline" required />
          <Field label="Повторите пароль" fieldKey="password2" placeholder="Повторите пароль"        secureEntry              icon="lock-closed-outline" required />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister} disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Создать аккаунт</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Уже есть аккаунт?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Войти</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.card },
    themeBtn:  { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    header:    {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: SIZES.screenPadding, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn:   {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
    },
    title:     { fontSize: 18, fontWeight: '700', color: colors.text },
    form:      { padding: SIZES.screenPadding, gap: 14 },
    nameRow:   { flexDirection: 'row', gap: 12 },
    fieldWrap: { gap: 6 },
    label:     { fontSize: 14, fontWeight: '600', color: colors.text },
    inputWrap: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
      borderRadius: SIZES.inputRadius, paddingHorizontal: 14, paddingVertical: 12,
    },
    input:     { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
    btn:       {
      backgroundColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingVertical: 15, alignItems: 'center', marginTop: 6,
      ...shadows.md,
    },
    btnText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
    link:      { alignItems: 'center', paddingVertical: 8 },
    linkText:  { fontSize: 14, color: colors.textSecondary },
  });
}
