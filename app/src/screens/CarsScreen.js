import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function CarsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, shadows } = useTheme();

  const [cars,       setCars]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal,      setModal]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [brand,      setBrand]      = useState('');
  const [model,      setModel]      = useState('');
  const [year,       setYear]       = useState('');

  const styles = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const load = useCallback(async () => {
    const res = await api.userCars();
    if (res.success) setCars(res.cars);
    setLoading(false); setRefreshing(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const addCar = async () => {
    if (!brand.trim() || !model.trim()) {
      Alert.alert('Ошибка', 'Укажите марку и модель'); return;
    }
    setSaving(true);
    const res = await api.addCar({ brand: brand.trim(), model: model.trim(), year: year ? parseInt(year) : null });
    setSaving(false);
    if (res.success) {
      setCars(prev => [res.car, ...prev]);
      setModal(false); setBrand(''); setModel(''); setYear('');
    } else {
      Alert.alert('Ошибка', res.message);
    }
  };

  const deleteCar = (car) => {
    Alert.alert(
      'Удалить автомобиль',
      `${car.brand} ${car.model}${car.year ? ' ' + car.year : ''}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить', style: 'destructive',
          onPress: async () => {
            const res = await api.deleteCar(car.id);
            if (res.success) setCars(prev => prev.filter(c => c.id !== car.id));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Мои автомобили</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={c => String(c.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>Нет добавленных автомобилей</Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={() => setModal(true)}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addFirstText}>Добавить автомобиль</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.carCard}>
              <View style={styles.carIcon}>
                <Ionicons name="car-sport-outline" size={26} color={colors.primary} />
              </View>
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{item.brand} {item.model}</Text>
                {item.year && <Text style={styles.carYear}>{item.year} год</Text>}
              </View>
              <TouchableOpacity onPress={() => deleteCar(item)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Add Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить автомобиль</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Марка <Text style={{ color: colors.error }}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Toyota, BMW, LADA..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Модель <Text style={{ color: colors.error }}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="Camry, X5, Granta..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Год выпуска</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="2020"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={addCar} disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Добавить</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.surface },
    center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header:       {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.card, paddingHorizontal: SIZES.screenPadding, paddingVertical: 14,
      ...shadows.sm,
    },
    backBtn:      {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
    },
    title:        { fontSize: 18, fontWeight: '700', color: colors.text },
    addBtn:       {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    list:         { padding: SIZES.screenPadding, gap: 12 },
    carCard:      {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: colors.card, borderRadius: SIZES.cardRadius,
      padding: 16, ...shadows.sm,
    },
    carIcon:      {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    },
    carInfo:      { flex: 1 },
    carName:      { fontSize: 15, fontWeight: '700', color: colors.text },
    carYear:      { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    deleteBtn:    { padding: 6 },
    empty:        { alignItems: 'center', paddingTop: 60, gap: 14 },
    emptyTitle:   { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
    addFirstBtn:  {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingHorizontal: 20, paddingVertical: 10,
    },
    addFirstText: { fontSize: 14, fontWeight: '600', color: colors.primary },
    modal:        { flex: 1, backgroundColor: colors.card },
    modalHeader:  {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: SIZES.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    modalTitle:   { fontSize: 18, fontWeight: '700', color: colors.text },
    modalBody:    { padding: SIZES.screenPadding, gap: 16 },
    fieldWrap:    { gap: 6 },
    label:        { fontSize: 14, fontWeight: '600', color: colors.text },
    input:        {
      backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
      borderRadius: SIZES.inputRadius, paddingHorizontal: 14, paddingVertical: 13,
      fontSize: 15, color: colors.text,
    },
    saveBtn:      {
      backgroundColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingVertical: 15, alignItems: 'center', marginTop: 8, ...shadows.md,
    },
    saveBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  });
}
