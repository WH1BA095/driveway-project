import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, FlatList, TextInput, Modal, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, getImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { SIZES } from '../constants/theme';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';

const { width: SW } = Dimensions.get('window');

export default function ProductScreen({ navigation, route }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors, shadows } = useTheme();
  const { addItem, items } = useCart();
  const inCart = items.some(i => i.product.id === Number(id));

  const [data,         setData]        = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [isFav,        setIsFav]       = useState(false);
  const [activeImg,    setActiveImg]   = useState(0);
  const [reviewModal,  setReviewModal] = useState(false);
  const [revRating,    setRevRating]   = useState(5);
  const [revTitle,     setRevTitle]    = useState('');
  const [revBody,      setRevBody]     = useState('');
  const [submitting,   setSubmitting]  = useState(false);
  // Q&A
  const [questions,    setQuestions]   = useState([]);
  const [qaModal,      setQaModal]     = useState(false);
  const [qaText,       setQaText]      = useState('');
  const [qaSubmitting, setQaSubmitting]= useState(false);

  const s = useMemo(() => makeStyles(colors, shadows), [colors, shadows]);

  const load = useCallback(async () => {
    setLoading(true);
    const [res, qRes] = await Promise.all([
      api.product(id),
      api.getQuestions(id),
    ]);
    if (res.success) {
      setData(res);
      setIsFav(res.is_favorited);
    }
    if (qRes.success) setQuestions(qRes.questions || []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleFav = async () => {
    if (!user) { navigation.navigate('ProfileTab', { screen: 'Login' }); return; }
    const res = await api.toggleFavorite(id);
    if (res.success) setIsFav(res.action === 'added');
  };

  const submitReview = async () => {
    if (!revBody.trim()) { Alert.alert('Ошибка', 'Напишите текст отзыва'); return; }
    setSubmitting(true);
    const res = await api.addReview({ product_id: id, rating: revRating, title: revTitle, body: revBody });
    setSubmitting(false);
    if (res.success) {
      setReviewModal(false);
      setRevTitle(''); setRevBody(''); setRevRating(5);
      load();
    } else {
      Alert.alert('Ошибка', res.message);
    }
  };

  const submitQuestion = async () => {
    if (!qaText.trim() || qaText.trim().length < 5) {
      Alert.alert('Ошибка', 'Вопрос слишком короткий (минимум 5 символов)'); return;
    }
    setQaSubmitting(true);
    const res = await api.addQuestion({ product_id: id, question: qaText.trim() });
    setQaSubmitting(false);
    if (res.success) {
      setQaModal(false);
      setQaText('');
      const qRes = await api.getQuestions(id);
      if (qRes.success) setQuestions(qRes.questions || []);
      Alert.alert('Готово', res.message);
    } else {
      Alert.alert('Ошибка', res.message);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!data) {
    return (
      <View style={s.center}>
        <Text style={{ color: colors.textSecondary }}>Товар не найден</Text>
      </View>
    );
  }

  const { product, images, reviews, similar } = data;
  const inStock = product.available > 0;

  return (
    <>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        {/* Back / Fav buttons */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={s.backBtn} onPress={toggleFav}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Gallery */}
        <View style={s.gallery}>
          <Image
            source={{ uri: images[activeImg] ? getImageUrl(images[activeImg].filename) : null }}
            style={s.mainImg}
            resizeMode="contain"
          />
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.thumbsRow}>
              {images.map((img, i) => (
                <TouchableOpacity
                  key={img.id || i}
                  style={[s.thumb, i === activeImg && s.thumbActive]}
                  onPress={() => setActiveImg(i)}
                >
                  <Image source={{ uri: getImageUrl(img.filename) }} style={s.thumbImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Info */}
        <View style={s.info}>
          <View style={s.badges}>
            <View style={[s.badge, inStock ? s.badgeIn : s.badgeOut]}>
              <Text style={[s.badgeText, { color: inStock ? colors.success : colors.error }]}>
                {inStock ? '✓ В наличии' : 'Нет в наличии'}
              </Text>
            </View>
            {product.type_name && (
              <View style={s.badgeGray}>
                <Text style={s.badgeGrayText}>{product.type_name}</Text>
              </View>
            )}
          </View>

          <Text style={s.name}>{product.name}</Text>

          <View style={s.ratingRow}>
            <StarRating rating={product.avg_rating} count={product.review_count} size={15} />
          </View>

          <Text style={s.price}>{Number(product.price).toLocaleString('ru-RU')} ₽</Text>

          <View style={s.metaGrid}>
            <MetaItem label="Артикул"   value={product.article}       colors={colors} />
            <MetaItem label="Бренд"     value={product.brand_name}    colors={colors} />
            <MetaItem label="Модель"    value={product.model_name}    colors={colors} />
            <MetaItem label="Категория" value={product.category_name} colors={colors} />
          </View>

          {product.description && (
            <View style={s.descBlock}>
              <Text style={s.descTitle}>Описание</Text>
              <Text style={s.descText}>{product.description}</Text>
            </View>
          )}
        </View>

        {/* Reviews */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Отзывы ({reviews.length})</Text>
            {user && (
              <TouchableOpacity onPress={() => setReviewModal(true)}>
                <Text style={s.writeReview}>+ Написать</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews.length === 0 ? (
            <View style={s.emptyReviews}>
              <Text style={s.emptyText}>Отзывов пока нет</Text>
              {user && (
                <TouchableOpacity style={s.firstReviewBtn} onPress={() => setReviewModal(true)}>
                  <Text style={s.firstReviewText}>Оставить первый отзыв</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            reviews.map(r => <ReviewCard key={r.id} review={r} colors={colors} />)
          )}
        </View>

        {/* Q&A */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Вопросы ({questions.length})</Text>
            {user && (
              <TouchableOpacity onPress={() => setQaModal(true)}>
                <Text style={s.writeReview}>+ Задать</Text>
              </TouchableOpacity>
            )}
          </View>

          {questions.length === 0 ? (
            <View style={s.emptyReviews}>
              <Ionicons name="help-circle-outline" size={36} color={colors.border} />
              <Text style={s.emptyText}>Вопросов пока нет</Text>
              {user && (
                <TouchableOpacity style={s.firstReviewBtn} onPress={() => setQaModal(true)}>
                  <Text style={s.firstReviewText}>Задать первый вопрос</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            questions.map(q => <QuestionCard key={q.id} question={q} colors={colors} />)
          )}
        </View>

        {/* Similar products */}
        {similar.length > 0 && (
          <View style={[s.section, { paddingHorizontal: 0 }]}>
            <Text style={[s.sectionTitle, { paddingHorizontal: SIZES.screenPadding }]}>Похожие товары</Text>
            <FlatList
              data={similar}
              keyExtractor={p => String(p.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.screenPadding, gap: 12, paddingTop: 10 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  style={{ width: 160 }}
                  onPress={() => navigation.push('Product', { id: item.id })}
                />
              )}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Buy bar */}
      <View style={[s.buyBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={s.buyPrice}>{Number(product.price).toLocaleString('ru-RU')} ₽</Text>
          <Text style={s.buyStock}>
            {inStock ? `В наличии: ${product.available} шт.` : 'Нет в наличии'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            s.buyBtn,
            inCart      && { backgroundColor: colors.success },
            !inStock    && { backgroundColor: colors.border },
          ]}
          disabled={!inStock}
          onPress={() => {
            if (!inCart) {
              addItem(product);
              Alert.alert('Добавлено в корзину', product.name, [
                { text: 'В корзину', onPress: () => navigation.navigate('CartTab') },
                { text: 'Продолжить' },
              ]);
            } else {
              navigation.navigate('CartTab');
            }
          }}
        >
          <Ionicons name={inCart ? 'cart' : 'cart-outline'} size={20} color="#fff" />
          <Text style={s.buyBtnText}>{inCart ? 'В корзине' : 'В корзину'}</Text>
        </TouchableOpacity>
      </View>

      {/* Review modal */}
      <Modal visible={reviewModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Оставить отзыв</Text>
            <TouchableOpacity onPress={() => setReviewModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding, gap: 16 }}>
            <View>
              <Text style={s.fieldLabel}>Оценка</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {[1,2,3,4,5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setRevRating(star)}>
                    <Ionicons
                      name={star <= revRating ? 'star' : 'star-outline'}
                      size={32}
                      color={colors.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={s.fieldLabel}>Заголовок</Text>
              <TextInput
                style={s.input}
                value={revTitle}
                onChangeText={setRevTitle}
                placeholder="Коротко о товаре..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View>
              <Text style={s.fieldLabel}>
                Отзыв <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[s.input, { height: 100, textAlignVertical: 'top' }]}
                value={revBody}
                onChangeText={setRevBody}
                placeholder="Расскажите подробнее..."
                placeholderTextColor={colors.textTertiary}
                multiline
              />
            </View>
            <TouchableOpacity
              style={[s.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={submitReview}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>Опубликовать отзыв</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Q&A modal */}
      <Modal visible={qaModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Задать вопрос</Text>
            <TouchableOpacity onPress={() => setQaModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding, gap: 16 }}>
            <View>
              <Text style={s.fieldLabel}>
                Ваш вопрос <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[s.input, { height: 120, textAlignVertical: 'top' }]}
                value={qaText}
                onChangeText={setQaText}
                placeholder="Напишите вопрос о товаре..."
                placeholderTextColor={colors.textTertiary}
                multiline
                autoFocus
              />
              <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                Минимум 5 символов · Ответ придёт от администратора
              </Text>
            </View>
            <TouchableOpacity
              style={[s.submitBtn, qaSubmitting && { opacity: 0.6 }]}
              onPress={submitQuestion}
              disabled={qaSubmitting}
            >
              {qaSubmitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>Отправить вопрос</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({ label, value, colors }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{value}</Text>
    </View>
  );
}

function ReviewCard({ review, colors }) {
  return (
    <View style={{
      paddingVertical: 14, borderBottomWidth: 1,
      borderBottomColor: colors.borderLight, gap: 6,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{review.author}</Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          {new Date(review.created_at).toLocaleDateString('ru-RU')}
        </Text>
      </View>
      <StarRating rating={review.rating} showNumber={false} size={13} />
      {review.title ? (
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{review.title}</Text>
      ) : null}
      <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>{review.body}</Text>
      {review.admin_reply && (
        <View style={{
          backgroundColor: colors.primaryBg, borderRadius: 8,
          padding: 10, gap: 4, marginTop: 4,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Ответ магазина
          </Text>
          <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>{review.admin_reply}</Text>
        </View>
      )}
    </View>
  );
}

function QuestionCard({ question, colors }) {
  const hasAnswer = !!question.answer;
  return (
    <View style={{
      paddingVertical: 14, borderBottomWidth: 1,
      borderBottomColor: colors.borderLight, gap: 8,
    }}>
      {/* Question row */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>?</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>{question.question}</Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            {question.display_name} · {new Date(question.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>

      {/* Answer or pending */}
      {hasAnswer ? (
        <View style={{
          flexDirection: 'row', gap: 8, alignItems: 'flex-start',
          backgroundColor: colors.primaryBg, borderRadius: 10, padding: 10,
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>D</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Driveway
            </Text>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>{question.answer}</Text>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 36 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textTertiary }} />
          <Text style={{ fontSize: 12, color: colors.textTertiary, fontStyle: 'italic' }}>
            Ожидает ответа
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles factory ───────────────────────────────────────────────────────────

function makeStyles(colors, shadows) {
  return StyleSheet.create({
    container:      { flex: 1, backgroundColor: colors.surface },
    center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },

    topBar:         {
      flexDirection: 'row', justifyContent: 'space-between',
      paddingHorizontal: SIZES.screenPadding, paddingBottom: 8,
      backgroundColor: colors.card,
    },
    backBtn:        {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
      ...shadows.sm,
    },

    gallery:        { backgroundColor: colors.card, paddingBottom: 12 },
    mainImg:        { width: SW, height: SW * 0.75, backgroundColor: colors.inputBg },
    thumbsRow:      { paddingHorizontal: SIZES.screenPadding, gap: 8, marginTop: 8 },
    thumb:          {
      width: 64, height: 64, borderRadius: 10,
      borderWidth: 2, borderColor: colors.border, overflow: 'hidden',
    },
    thumbActive:    { borderColor: colors.primary },
    thumbImg:       { width: '100%', height: '100%' },

    info:           { padding: SIZES.screenPadding, gap: 10, backgroundColor: colors.card },
    badges:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    badgeIn:        { backgroundColor: colors.successBg, borderColor: '#C8E6C9' },
    badgeOut:       { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    badgeText:      { fontSize: 12, fontWeight: '600' },
    badgeGray:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.inputBg },
    badgeGrayText:  { fontSize: 12, color: colors.textSecondary },
    name:           { fontSize: 18, fontWeight: '700', color: colors.text, lineHeight: 24 },
    ratingRow:      { flexDirection: 'row' },
    price:          { fontSize: 28, fontWeight: '800', color: colors.primary },
    metaGrid:       { backgroundColor: colors.inputBg, borderRadius: SIZES.cardRadius, padding: 14, gap: 8 },
    descBlock:      { gap: 6 },
    descTitle:      { fontSize: 15, fontWeight: '700', color: colors.text },
    descText:       { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

    section:        {
      paddingHorizontal: SIZES.screenPadding, paddingVertical: 16,
      borderTopWidth: 1, borderTopColor: colors.borderLight,
      backgroundColor: colors.card, marginTop: 8,
    },
    sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle:   { fontSize: 17, fontWeight: '700', color: colors.text },
    writeReview:    { fontSize: 14, color: colors.primary, fontWeight: '600' },
    emptyReviews:   { alignItems: 'center', gap: 10, paddingVertical: 20 },
    emptyText:      { fontSize: 14, color: colors.textSecondary },
    firstReviewBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary },
    firstReviewText:{ fontSize: 14, color: colors.primary, fontWeight: '600' },

    buyBar:         {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: colors.card,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: SIZES.screenPadding, paddingTop: 12,
      borderTopWidth: 1, borderTopColor: colors.border,
      ...shadows.lg,
    },
    buyPrice:       { fontSize: 20, fontWeight: '800', color: colors.primary },
    buyStock:       { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    buyBtn:         {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingHorizontal: 24, paddingVertical: 14,
    },
    buyBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff' },

    modal:          { flex: 1, backgroundColor: colors.card },
    modalHeader:    {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: SIZES.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    modalTitle:     { fontSize: 18, fontWeight: '700', color: colors.text },
    fieldLabel:     { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
    input:          {
      backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
      borderRadius: SIZES.inputRadius, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 14, color: colors.text,
    },
    submitBtn:      {
      backgroundColor: colors.primary, borderRadius: SIZES.buttonRadius,
      paddingVertical: 15, alignItems: 'center',
    },
    submitBtnText:  { fontSize: 15, fontWeight: '700', color: '#fff' },
  });
}
