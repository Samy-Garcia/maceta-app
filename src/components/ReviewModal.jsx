import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { typeLabel } from '../utils/productTypes.js';

// Deja una reseña de una pieza ya entregada. Si el pedido trae varias, primero
// se elige cuál se va a calificar.
export default function ReviewModal({ order, onClose, onSubmit, saving }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const items = (order?.products || []).filter((item) => item.product?._id);

  const [selected, setSelected] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setSelected(0);
    setRating(5);
    setComment('');
  }, [order?._id]);

  const item = items[selected];
  const canSubmit = !!item && comment.trim().length > 0 && !saving;

  return (
    <Modal visible={!!order} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Deja tu reseña</Text>
          <Text style={styles.subtitle}>Pedido {order?.orderCode}</Text>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {items.length > 1 ? (
              <>
                <Text style={styles.label}>¿Qué pieza quieres calificar?</Text>
                {items.map((product, index) => {
                  const active = index === selected;
                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={[styles.itemRow, active && styles.itemRowActive]}
                      onPress={() => setSelected(index)}
                      activeOpacity={0.8}
                    >
                      {product.product?.image ? (
                        <Image source={{ uri: product.product.image }} style={styles.itemImage} />
                      ) : (
                        <View style={[styles.itemImage, styles.itemImageFallback]}>
                          <Ionicons name="leaf-outline" size={16} color={colors.placeholder} />
                        </View>
                      )}
                      <View style={styles.itemTexts}>
                        <Text style={styles.itemName} numberOfLines={1}>{product.product?.name}</Text>
                        <Text style={styles.itemType}>{typeLabel(product.productType)}</Text>
                      </View>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active ? <View style={styles.radioDot} /> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : item ? (
              <View style={styles.singleItem}>
                {item.product?.image ? (
                  <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                ) : null}
                <Text style={styles.itemName} numberOfLines={1}>{item.product?.name}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Tu calificación</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setRating(index + 1)}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={index < rating ? 'star' : 'star-outline'}
                    size={30}
                    color="#E8A33D"
                    style={styles.star}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tu comentario</Text>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="Cuéntanos qué te pareció la pieza..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
              onPress={() => onSubmit({ item, rating, comment })}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Publicar reseña</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: {
      maxHeight: '85%',
      backgroundColor: isDark ? colors.card : colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 24,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 14,
    },
    title: { fontFamily: SERIF, fontSize: 20, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 12, color: colors.placeholder, marginTop: 3, marginBottom: 10 },

    label: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    itemRowActive: { borderColor: colors.primary },
    itemImage: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.border },
    itemImageFallback: { alignItems: 'center', justifyContent: 'center' },
    itemTexts: { flex: 1, marginHorizontal: 10 },
    itemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    itemType: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    singleItem: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: colors.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

    starsRow: { flexDirection: 'row' },
    star: { marginRight: 6 },

    input: {
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
      borderRadius: 14,
      backgroundColor: isDark ? colors.surface : '#F7F9F8',
      padding: 14,
      minHeight: 96,
      fontSize: 13.5,
      color: colors.text,
    },

    footer: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
    cancelButton: { paddingHorizontal: 18, paddingVertical: 14 },
    cancelText: { fontSize: 14, fontWeight: '700', color: colors.maroon },
    submitButton: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    submitDisabled: { opacity: 0.45 },
    submitText: { fontSize: 15, fontWeight: '700', color: colors.white },
  });
