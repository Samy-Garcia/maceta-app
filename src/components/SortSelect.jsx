import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext.jsx';

// Selector de orden del catálogo. Las opciones las define useProducts y todas
// se calculan con campos reales del producto (precio, fecha, calificación).
export default function SortSelect({ options, value, onChange }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.key === value) || options[0];

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={styles.triggerLabel}>Ordenar: </Text>
        <Text style={styles.triggerValue}>{current.label}</Text>
        <Ionicons name="chevron-down" size={13} color={colors.text} style={styles.chevron} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Ordenar por</Text>
            {options.map((option) => {
              const selected = option.key === value;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={styles.option}
                  onPress={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>
                    {option.label}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={17} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    trigger: { flexDirection: 'row', alignItems: 'center' },
    triggerLabel: { fontSize: 12, color: colors.placeholder },
    triggerValue: { fontSize: 12, fontWeight: '700', color: colors.text },
    chevron: { marginLeft: 3 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 30,
    },
    sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    optionLabel: { fontSize: 14, color: colors.text },
    optionLabelActive: { fontWeight: '700', color: colors.primary },
  });
